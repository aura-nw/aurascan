import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogConfig as MatDialogConfig,
} from '@angular/material/legacy-dialog';
import BigNumber from 'bignumber.js';
import { Contract, JsonFragment, parseEther } from 'ethers';
import { Observable, Subject, takeUntil } from 'rxjs';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { WRITE_STATE_MUTABILITY } from 'src/app/core/models/evm-contract.model';
import { IMultichainWalletAccount } from 'src/app/core/models/wallet';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { validateAndParsingInput } from 'src/app/core/utils/ethers/validate';
import { PopupAddZeroComponent } from 'src/app/shared/components/popup-add-zero/popup-add-zero.component';

type Error = {
  code?: string;
  message?: string;
};
type JsonFragmentExtends = JsonFragment & {
  formGroup?: FormGroup;
  isValidate?: boolean;
  result?: string;
  isLoading?: boolean;
  extendedInputs?: JsonFragmentExtends[];
  error?: Error;
};

@Component({
  selector: 'app-evm-write',
  templateUrl: './evm-write.component.html',
  styleUrls: ['./evm-write.component.scss'],
})
export class EvmWriteComponent implements OnChanges {
  @Input() contractAddress: string;
  @Input() abi: JsonFragment[];
  @Input() isProxyContract = false;

  isExpand = false;
  chainInfo = this.env.chainInfo;

  extendedAbi: JsonFragmentExtends[];
  contract: Contract;
  wallet$: Observable<IMultichainWalletAccount> = this.walletService.walletAccount$;
  destroyed$ = new Subject<void>();
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(takeUntil(this.destroyed$));
  denom = this.env.chainInfo.currencies[0].coinDenom;

  constructor(
    private walletService: WalletService,
    private dialog: MatDialog,
    private env: EnvironmentService,
    private fb: FormBuilder,
    private toastr: NgxToastrService,
    private layout: BreakpointObserver,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['abi']) {
      const extendedAbi: JsonFragmentExtends[] =
        this.abi?.filter(
          (abi: JsonFragment) => WRITE_STATE_MUTABILITY.includes(abi.stateMutability) && abi.type == 'function',
        ) || [];

      extendedAbi.forEach((abi) => {
        const inputs = [...abi.inputs, { name: 'fund', type: this.denom }];
        const group = inputs.reduce((prevValue, curValue) => {
          const control = this.fb.control('', curValue.name === 'fund' ? null : Validators.required);

          return {
            ...prevValue,
            [curValue.name]: control,
          };
        }, {});

        abi['extendedInputs'] = inputs;
        abi['formGroup'] = this.fb.group(group);
      });

      this.extendedAbi = extendedAbi;
    }
    this.resetForm();
  }

  disconnect() {
    this.walletService.disconnect();
  }

  expandMenu(closeAll = false): void {
    for (let i = 0; i < document.getElementsByClassName('content-contract').length; i++) {
      let element: HTMLElement = document.getElementsByClassName('content-contract')[i] as HTMLElement;
      let expand = element.getAttribute('aria-expanded');
      if (closeAll) {
        if (expand == 'true') {
          element.click();
        }
      } else {
        if (expand === this.isExpand.toString()) {
          element.click();
        }
      }
    }
    if (!closeAll) {
      this.isExpand = !this.isExpand;
    }
  }

  reloadData() {
    this.expandMenu(true);
    this.isExpand = false;

    this.resetForm();
  }

  resetForm() {
    this.extendedAbi.forEach((ea) => {
      ea.formGroup.reset();
      ea.isValidate = false;
      ea.result = undefined;
      ea.error = undefined;
    });
  }

  connectWallet(): void {
    this.walletService.getAccount();
  }

  async handleExecute(jsonFragment: JsonFragmentExtends) {
    if (!jsonFragment) {
      return;
    }

    jsonFragment.isValidate = true;

    const { formGroup, extendedInputs, name } = jsonFragment;

    if (formGroup.invalid) {
      return;
    }
    const formControls = formGroup.controls;

    const listWithOutFund = extendedInputs?.filter((i) => i.name !== 'fund');
    let paramsDes = [];
    const params = listWithOutFund?.map((i) => {
      const value = formControls[i.name].value?.trim();
      if (i.type) {
        paramsDes.push(i.type);
      }
      return validateAndParsingInput(i, value); // TODO
    });

    const errorParams = params.map((i) => i.error).filter((f) => f);
    if (errorParams.length > 0) {
      jsonFragment.isLoading = false;
      jsonFragment.error = {
        code: 'INVALID_ARGUMENT',
        message: errorParams.join(' '),
      };
      return;
    }

    const fundAmount = formControls['fund']?.value || '0';

    const connected = await this.walletService.connectToChain();

    if (!connected) {
      jsonFragment.isLoading = false;
      jsonFragment.error = { code: 'error', message: `Please switch to ${this.env.evmChainInfo.chain} chain.` };
      return;
    }

    const contract = await this.createContract();

    if (!contract) {
      return;
    }

    jsonFragment.isLoading = true;
    jsonFragment.result = undefined;
    jsonFragment.error = undefined;

    const paramsData = params.map((i) => i.value);
    const nameContract = `${name}(${paramsDes.join(',')})`;
    const x = await contract[nameContract]?.estimateGas(...paramsData).catch((e) => e);
    contract[nameContract]?.(...paramsData, {
      gasLimit: Number(x) || 250_000,
      gasPrice: 1_000_0000,
      value: parseEther(fundAmount),
    })
      .then((res) => {
        jsonFragment.result = res;
        jsonFragment.isLoading = false;
      })
      .catch((error) => {
        this.toastr.error(error);
        jsonFragment.isLoading = false;
        jsonFragment.error = { code: error.code, message: error.message };
      });
  }

  async createContract() {
    try {
      const accountSigner = await this.walletService.getEvmAccount();

      if (!accountSigner) {
        return undefined;
      }

      let contract = new Contract(this.contractAddress, this.abi, accountSigner);

      if (contract) {
        this.contract = contract;

        return this.contract;
      }
    } catch (error) {
      console.error(error);
    }

    return null;
  }

  addZero(jsonFragment: JsonFragmentExtends, controlName: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'grant-overlay-panel';
    dialogConfig.data = {};
    let dialogRef = this.dialog.open(PopupAddZeroComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const control = jsonFragment.formGroup.controls[controlName];

        const multiplier = Number(result) > 0 ? Number(result) : result.length;
        const zeroString = BigNumber(1).toFormat(multiplier).replace('1.', '');

        control.setValue(`${control.value || 1}${zeroString}`);
        control.updateValueAndValidity();
      }
    });
  }
}
