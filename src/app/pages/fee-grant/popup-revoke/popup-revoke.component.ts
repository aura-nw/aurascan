import { Component, Inject, OnInit } from '@angular/core';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import { MsgRevokeAllowance } from 'cosmjs-types/cosmos/feegrant/v1beta1/tx';
import { TRANSACTION_TYPE_ENUM } from 'src/app/core/constants/transaction.enum';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WalletService } from 'src/app/core/services/wallet.service';

@Component({
  selector: 'app-popup-revoke',
  templateUrl: './popup-revoke.component.html',
  styleUrls: ['./popup-revoke.component.scss'],
})
export class PopupRevokeComponent implements OnInit {
  walletAccount: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { granterAddress: string; granteeAddress: string },
    public dialogRef: MatDialogRef<PopupRevokeComponent>,
    private walletService: WalletService,
    private toastr: NgxToastrService,
  ) {}

  ngOnInit(): void {}

  closeDialog(hash = null) {
    this.dialogRef.close(hash);
  }

  revoke() {
    const account = this.walletService.getAccount();

    if (!account) {
      return;
    }

    const msg = {
      typeUrl: TRANSACTION_TYPE_ENUM.MsgRevokeAllowance,
      value: MsgRevokeAllowance.fromPartial({
        granter: this.data.granterAddress,
        grantee: this.data.granteeAddress,
      }),
    };

    this.walletService
      .signAndBroadcast(account.address, [msg])
      .then((result) => {
        this.closeDialog(result.transactionHash);
      })
      .catch((error) => {
        if (error?.message != 'Request rejected') {
          this.toastr.error(error);
        }
      });
  }
}
