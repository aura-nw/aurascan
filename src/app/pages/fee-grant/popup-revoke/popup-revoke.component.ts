import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WalletService } from 'src/app/core/services/wallet.service';

@Component({
  selector: 'app-popup-revoke',
  templateUrl: './popup-revoke.component.html',
  styleUrls: ['./popup-revoke.component.scss'],
})

export class PopupRevokeComponent implements OnInit {
  isLoading = false;
  walletAccount: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { granterAddress: string; granteeAddress: string },
    public dialogRef: MatDialogRef<PopupRevokeComponent>,
    public walletService: WalletService,
  ) {}

  ngOnInit(): void {}

  closeDialog() {
    this.dialogRef.close('');
  }

  connectWallet(): void {
    this.walletAccount = this.walletService.getAccount();
  }

  executeRevoke() {
    //TODO
  }
}
