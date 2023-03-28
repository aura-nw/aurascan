import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ESigningType, SIGNING_MESSAGE_TYPES } from 'src/app/core/constants/wallet.constant';
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
    public walletService: WalletService,
    public environmentService: EnvironmentService,
    private toastr: NgxToastrService,
  ) {}

  ngOnInit(): void {}

  closeDialog(hash = null) {
    this.dialogRef.close(hash);
  }

  connectWallet(): void {
    this.walletAccount = this.walletService.getAccount();
  }

  executeRevoke() {
    const granter = this.walletService.wallet?.bech32Address;
    const executeRevoke = async () => {
      const { hash, error } = await this.walletService.signAndBroadcast({
        messageType: SIGNING_MESSAGE_TYPES.REVOKE_ALLOWANCE,
        message: {
          granter: this.data.granterAddress,
          grantee: this.data.granteeAddress,
        },
        senderAddress: granter,
        network: this.environmentService.configValue.chain_info,
        signingType: ESigningType.Keplr,
        chainId: this.walletService.chainId,
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
