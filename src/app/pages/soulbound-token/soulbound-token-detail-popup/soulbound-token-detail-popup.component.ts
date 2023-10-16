import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { MEDIA_TYPE } from 'src/app/core/constants/common.constant';
import { MESSAGES_CODE_CONTRACT } from 'src/app/core/constants/messages.constant';
import { CommonService } from 'src/app/core/services/common.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { checkTypeFile } from 'src/app/core/utils/common/info-common';
import { ABTActionType } from 'src/app/core/constants/token.enum';
import { AbtRejectPopupComponent } from 'src/app/pages/soulbound-token/abt-reject-popup/abt-reject-popup.component';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { SB_TYPE } from 'src/app/core/constants/soulbound.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';

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
  imageUrl = '';
  animationUrl = '';
  ABT_ACTION = ABTActionType;
  currentABTAction = ABTActionType.Reject;
  abtType = SB_TYPE;

  constructor(
    @Inject(MAT_DIALOG_DATA) public soulboundDetail: any,
    public dialogRef: MatDialogRef<SoulboundTokenDetailPopupComponent>,
    public commonService: CommonService,
    private walletService: WalletService,
    private toastr: NgxToastrService,
    public translate: TranslateService,
    private dialog: MatDialog,
    private soulboundService: SoulboundService,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    if (this.soulboundDetail?.ipfs?.image) {
      this.imageUrl = this.replaceImgIpfs(this.soulboundDetail?.ipfs?.image);
    }
    if (this.soulboundDetail?.ipfs?.animation_url) {
      if (!this.soulboundDetail?.ipfs?.image) {
        if (this.getTypeFile(this.soulboundDetail) === MEDIA_TYPE.IMG) {
          this.imageUrl = this.replaceImgIpfs(this.soulboundDetail?.ipfs?.animation_url);
        } else {
          this.animationUrl = this.replaceImgIpfs(this.soulboundDetail?.ipfs?.animation_url);
        }
      } else if (this.getTypeFile(this.soulboundDetail) !== MEDIA_TYPE.IMG) {
        this.animationUrl = this.replaceImgIpfs(this.soulboundDetail?.ipfs?.animation_url);
      } else {
        this.imageUrl = this.replaceImgIpfs(this.soulboundDetail?.ipfs?.image);
      }
    }
  }

  handleRejectABT(rejectAll = false) {
    let dialogRef = this.dialog.open(AbtRejectPopupComponent, {
      panelClass: 'AbtRejectPopup',
      data: {
        rejectAll: rejectAll,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== 'canceled') {
        this.rejectABT(result);
      }
    });
  }

  rejectABT(rejectAll = false) {
    const payload = {
      tokenId: this.soulboundDetail.token_id,
      contractAddress: this.soulboundDetail.contract_address,
      receiverAddress: this.soulboundDetail.receiver_address,
      rejectAll: rejectAll,
    };
    this.soulboundService.rejectABT(payload).subscribe((res) => {
      if (res?.data?.affected) {
        let message = `ABT '${this.soulboundDetail.token_name_ipfs}' has been removed from your unclaimed list`;
        if (rejectAll) {
          const firstChar = this.soulboundDetail.minter_address.substring(0, 8);
          const lastChar = this.soulboundDetail.minter_address.substring(
            this.soulboundDetail.minter_address.length - 8,
          );
          let value = firstChar + '...' + lastChar;
          message = `All ABTs from creator ${value} have been removed from your unclaimed list`;
        }
        this.toastr.warning(message);
      } else {
        this.toastr.error('Error when execute');
      }
      this.dialogRef.close('reject');
    });
  }

  replaceImgIpfs(value) {
    return this.environmentService.configValue.ipfsDomain + value.replace('://', '/');
  }

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

  isObject(data) {
    return typeof data === 'object' && data !== null;
  }

  getTypeFile(nft: any) {
    let nftType = checkTypeFile(nft);
    return nftType;
  }
}
