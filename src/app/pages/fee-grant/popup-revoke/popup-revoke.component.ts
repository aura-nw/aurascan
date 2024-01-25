import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { SIGNING_MESSAGE_TYPES } from 'src/app/core/constants/wallet.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
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
    private environmentService: EnvironmentService,
    private toastr: NgxToastrService,
  ) {}

  ngOnInit(): void {}

  closeDialog(hash = null) {
    this.dialogRef.close(hash);
  }

  executeRevoke() {
    const granter = this.walletService.walletAccount?.address;
    const executeRevoke = async () => {
      const { hash, error } = await this.walletService.signAndBroadcast({
        messageType: SIGNING_MESSAGE_TYPES.REVOKE_ALLOWANCE,
        message: {
          granter: this.data.granterAddress,
          grantee: this.data.granteeAddress,
        },
        senderAddress: granter,
        network: this.environmentService.chainInfo,
        chainId: this.walletService.chain.chain_id,
      });

      if (hash) {
        this.closeDialog(hash);
      } else {
        if (error != 'Request rejected') {
          this.toastr.error(error);
        }
      }
    };
    executeRevoke();
  }
}
