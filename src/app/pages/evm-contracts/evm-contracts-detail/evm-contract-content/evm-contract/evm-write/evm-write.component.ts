import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogConfig as MatDialogConfig,
} from '@angular/material/legacy-dialog';
import BigNumber from 'bignumber.js';
import { Contract, ethers, JsonFragment, parseEther } from 'ethers';
import { Observable, Subject, takeUntil } from 'rxjs';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { WRITE_STATE_MUTABILITY } from 'src/app/core/models/evm-contract.model';
import { IMultichainWalletAccount } from 'src/app/core/models/wallet';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { validateAndParsingInput } from 'src/app/core/utils/ethers/validate';
import { PopupAddZeroComponent } from 'src/app/shared/components/popup-add-zero/popup-add-zero.component';

type JsonFragmentExtends = JsonFragment & {
  formGroup?: FormGroup;
  isValidate?: boolean;
  result?: string;
  isLoading?: boolean;
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
        const group = abi.inputs.reduce((prevValue, curValue) => {
          const control = this.fb.control('', Validators.required);

          return {
            ...prevValue,
            [curValue.name]: control,
          };
        }, {});

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
    });
  }

  connectWallet(): void {
    this.walletService.getAccount();
  }

  handleExecute(jsonFragment: JsonFragmentExtends) {
    if (!jsonFragment) {
      return;
    }

    jsonFragment.isValidate = true;

    const { formGroup, inputs, name } = jsonFragment;

    if (formGroup.invalid) {
      return;
    }
    const formControls = formGroup.controls;

    const params = inputs?.map((i) => {
      const value = formControls[i.name].value;
      return validateAndParsingInput(i, value); // TODO
    });

    const contract = this.createContract();

    if (!contract) {
      return;
    }

    console.log(params);

    jsonFragment.isLoading = true;

    contract[name]?.(...params, {
      gasLimit: 250000,
      gasPrice: 9000000000,
      nonce: 0,
      value: parseEther('1'),
    })
      .then((res) => {
        jsonFragment.result = res;
        jsonFragment.isLoading = false;
      })
      .catch((e) => {
        this.toastr.error(e);

        jsonFragment.isLoading = false;
        jsonFragment.result = 'No Data';
      });
  }

  createContract() {
    if (this.contract) {
      return this.contract;
    }

    try {
      const account = this.walletService.getEvmAccount();

      if (!account?.evmAccount) {
        return undefined;
      }

      let contract = new Contract(this.contractAddress, this.abi, account.evmAccount);

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
