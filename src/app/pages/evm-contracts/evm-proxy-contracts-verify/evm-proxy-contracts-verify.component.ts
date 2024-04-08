import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogConfig as MatDialogConfig,
} from '@angular/material/legacy-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { LENGTH_CHARACTER } from 'src/app/core/constants/common.constant';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { EWalletType } from 'src/app/core/constants/wallet.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { isContract } from 'src/app/core/utils/common/validation';
import { PopupProxyContractComponent } from './popup-proxy-contract/popup-proxy-contract.component';

@Component({
  selector: 'app-evm-proxy-contracts-verify',
  templateUrl: './evm-proxy-contracts-verify.component.html',
  styleUrls: ['./evm-proxy-contracts-verify.component.scss'],
})
export class EvmProxyContractsVerifyComponent implements OnInit, OnDestroy {
  contractAddress = '';
  inputFileValue = null;

  loading = false;
  isValidAddress = false;
  interupt$ = new Subject<void>();
  chainInfo = this.env.chainInfo;
  popupData = {};
  modePopup = {
    SUCCESS: 'Success',
    WARNING: 'Warning',
    ERROR: 'Error',
  };
  isVerifying = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private env: EnvironmentService,
    private contractService: ContractService,
    private dialog: MatDialog,
  ) {
    this.contractAddress = this.route.snapshot.paramMap.get('contractAddress')?.toLowerCase();

    if (this.contractAddress.trim().length === 0) {
      this.router.navigate(['evm-contracts']);
    }
  }

  ngOnDestroy(): void {
    this.interupt$.next();
    this.interupt$.complete();
  }

  contractForm: UntypedFormGroup;

  ngOnInit(): void {
    this.validAddress();
  }

  checkStatusVerify() {
    this.contractService;
  }

  validAddress() {
    this.isValidAddress = false;
    if (
      this.contractAddress?.length > 0 &&
      (isContract(this.contractAddress, this.chainInfo.bech32Config.bech32PrefixAccAddr) ||
        (this.contractAddress.startsWith(EWalletType.EVM) &&
          this.contractAddress?.length === LENGTH_CHARACTER.EVM_ADDRESS))
    ) {
      this.isValidAddress = true;
    }
  }

  clearInput() {
    this.contractAddress = null;
    this.isValidAddress = false;
  }

  verifyProxyContract() {
    //return if verifying
    if (this.isVerifying) {
      return;
    }

    this.popupData['modePopup'] = this.modePopup.ERROR;
    this.popupData['proxyContract'] = this.contractAddress;
    this.isVerifying = true;
    this.contractService.loadProxyContractDetail(this.contractAddress).subscribe({
      next: (res) => {
        this.popupData['implementationContract'] = res?.implementation_contract || '';
        if (res?.implementation_contract) {
          this.popupData['modePopup'] = this.modePopup.WARNING;
          this.getListContractInfo(this.popupData['implementationContract']);
        }
      },
      error: (err) => {
        this.popupData['modePopup'] = this.modePopup.ERROR;
        this.openPopup();
      },
    });
  }

  getListContractInfo(address) {
    this.contractService.getListContractInfo(address).subscribe((res) => {
      if (res.evm_contract_verification?.length > 0) {
        if (res.evm_contract_verification[0]?.status === ContractVerifyType.Verified) {
          this.popupData['modePopup'] = this.modePopup.SUCCESS;
        }
      }
      this.openPopup();
    });
  }

  openPopup() {
    this.isVerifying = false;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'grant-overlay-panel';
    dialogConfig.disableClose = true;
    dialogConfig.data = this.popupData;
    let dialogRef = this.dialog.open(PopupProxyContractComponent, dialogConfig);
  }
}
