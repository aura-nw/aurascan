import { Component, Inject, OnInit } from '@angular/core';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EWalletType } from 'src/app/core/constants/wallet.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';

@Component({
  selector: 'app-popup-proxy-contract',
  templateUrl: './popup-proxy-contract.component.html',
  styleUrls: ['./popup-proxy-contract.component.scss'],
})
export class PopupProxyContractComponent implements OnInit {
  isContract = false;
  isError = false;
  eWalletType = EWalletType;
  modePopup = {
    SUCCESS: 'Success',
    WARNING: 'Warning',
    ERROR: 'Error',
  };
  displayMode = this.modePopup.WARNING;
  codeId;
  address;

  chainName = this.environmentService.chainName.toLowerCase();
  chainInfo = this.environmentService.chainInfo;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopupProxyContractComponent>,
    public translate: TranslateService,
    private environmentService: EnvironmentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.address = this.data['proxyContract'];
    this.displayMode = this.data['modePopup'];
  }

  closeDialog(status = null) {
    this.dialogRef.close(status);
    if (this.displayMode === this.modePopup.SUCCESS && status === 'close') {
      window.history.back();
    }
  }

  navigateToVerify() {
    this.dialogRef.close();
    this.router.navigate(['/evm-contracts', this.data['implementationContract'], 'verify']);
  }

  navigateToAddress(address) {
    this.dialogRef.close();
    this.router.navigate(['/evm-contracts', address]);
  }
}
