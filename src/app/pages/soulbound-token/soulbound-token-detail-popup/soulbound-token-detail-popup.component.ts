import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MEDIA_TYPE } from 'src/app/core/constants/common.constant';
import { MESSAGES_CODE_CONTRACT } from 'src/app/core/constants/messages.constant';
import { CommonService } from 'src/app/core/services/common.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { checkTypeFile } from 'src/app/core/utils/common/info-common';

@Component({
  selector: 'app-soulbound-token-detail-popup',
  templateUrl: './soulbound-token-detail-popup.component.html',
  styleUrls: ['./soulbound-token-detail-popup.component.scss'],
})
export class SoulboundTokenDetailPopupComponent implements OnInit {
  isError = false;
  currentAddress = '';
  isLoading = false;
  MEDIA_TYPE = MEDIA_TYPE;

  constructor(
    @Inject(MAT_DIALOG_DATA) public soulboundDetail: any,
    public dialogRef: MatDialogRef<SoulboundTokenDetailPopupComponent>,
    public commonService: CommonService,
    private walletService: WalletService,
    private toastr: NgxToastrService,
    public translate: TranslateService,
  ) {}

  ngOnInit(): void {}

  error(): void {
    this.isError = true;
  }

  closeDialog() {
    this.dialogRef.close('canceled');
  }

  async equipSB() {
    this.isLoading = true;
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
      this.execute(msgExecute);
    }
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
                this.isLoading = false;
                this.toastr.success(this.translate.instant('NOTICE.SUCCESS_TRANSACTION'));
                this.dialogRef.close();
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

  isObject(data){
    return typeof data === 'object' && data !== null
  }

  getTypeFile(nft: any) {
    let nftType = checkTypeFile(nft);
    return nftType;
  }
}
