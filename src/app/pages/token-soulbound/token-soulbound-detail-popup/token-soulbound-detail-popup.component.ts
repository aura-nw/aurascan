import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MESSAGES_CODE_CONTRACT } from 'src/app/core/constants/messages.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { MappingErrorService } from 'src/app/core/services/mapping-error.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WalletService } from 'src/app/core/services/wallet.service';

@Component({
  selector: 'app-token-soulbound-detail-popup',
  templateUrl: './token-soulbound-detail-popup.component.html',
  styleUrls: ['./token-soulbound-detail-popup.component.scss'],
})
export class TokenSoulboundDetailPopupComponent implements OnInit {
  isError = false;
  currentAddress = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public soulboundDetail: any,
    public dialogRef: MatDialogRef<TokenSoulboundDetailPopupComponent>,
    private environmentService: EnvironmentService,
    public commonService: CommonService,
    private walletService: WalletService,
    private toastr: NgxToastrService,
    public translate: TranslateService,
    private mappingErrorService: MappingErrorService
  ) {}

  ngOnInit(): void {}

  error(): void {
    this.isError = true;
  }

  closeDialog() {
    this.dialogRef.close('canceled');
  }

  async equipSB() {
    this.currentAddress = this.walletService.wallet?.bech32Address;

    if (this.currentAddress) {
      const msgExecute = {
        take: {
          from: this.soulboundDetail.minter_address,
          uri: this.soulboundDetail.token_uri,
          signature: {
            hrp: 'aura',
            pub_key: this.soulboundDetail.pub_key,
            signature: this.soulboundDetail.signature,
          },
        },
      };

      console.log(msgExecute);

      // this.walletService.walletExecute(
      //   this.walletService.wallet.bech32Address,
      //   this.soulboundDetail.contract_address,
      //   msgExecute,
      // );

      this.execute(msgExecute);
    }


    // const payload = {
    //   signature: dataKeplr.signature,
    //   msg: this.soulboundDetail.token_id,
    //   pubKey: dataKeplr.pub_key.value,
    //   id: this.soulboundDetail.token_id,
    //   status: this.soulboundDetail.status,
    // };

    // this.soulboundService.updatePickSBToken(payload).subscribe((res) => {
    //   if (res?.code) {
    //     let msgError = res?.message.toString() || 'Error';
    //     this.toastr.error(msgError);
    //   } else {
    //     this.toastr.success(MESSAGES_CODE.SUCCESSFUL.Message);
    //     this.dialogRef.close();
    //   }
    //   // this.getListSB();
    // });
  }

  execute(data) {
    let msgError = MESSAGES_CODE_CONTRACT[5].Message;
    msgError = msgError ? msgError.charAt(0).toUpperCase() + msgError.slice(1) : 'Error';
    try {
      this.walletService
        .execute(this.currentAddress, this.soulboundDetail.contract_address, data)
        .then((e) => {
          if ((e as any).result?.error) {
            this.toastr.error(msgError);
          } else {
            if ((e as any)?.transactionHash) {
              this.toastr.loading((e as any)?.transactionHash);
              setTimeout(() => {
                this.toastr.success(this.translate.instant('NOTICE.SUCCESS_TRANSACTION'));
                this.dialogRef.close();
                // this.checkDetailTx

                // this.mappingErrorService.checkDetailTx((e as any)?.transactionHash).then(() => this.getListGrant());
              }, 4000);
            }
          }
        })
        .catch((error) => {
          if (!error.toString().includes('Request rejected')) {
            this.toastr.error(msgError);
          }
        });
    } catch (error) {
      this.toastr.error(`Error: ${msgError}`);
    }
  }
}
