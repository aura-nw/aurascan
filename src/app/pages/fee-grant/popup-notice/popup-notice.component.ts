import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { WalletService } from 'src/app/core/services/wallet.service';

@Component({
  selector: 'app-popup-notice',
  templateUrl: './popup-notice.component.html',
  styleUrls: ['./popup-notice.component.scss'],
})
export class PopupNoticeComponent implements OnInit {
  isLoading = false;
  walletAccount: any;

  constructor(
    public dialogRef: MatDialogRef<PopupNoticeComponent>,
    public walletService: WalletService,
    public environmentService: EnvironmentService
  ) {}

  ngOnInit(): void {}

  closeDialog(isConfirm = false) {
    this.dialogRef.close(isConfirm);
  }

  connectWallet(): void {
    this.walletAccount = this.walletService.getAccount();
  }
}
