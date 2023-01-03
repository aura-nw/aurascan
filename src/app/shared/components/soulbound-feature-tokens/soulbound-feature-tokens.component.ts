import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LIMIT_NUM_SBT, SB_TYPE } from 'src/app/core/constants/soulbound.constant';
import { CommonService } from 'src/app/core/services/common.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { TokenSoulboundDetailPopupComponent } from 'src/app/pages/token-soulbound/token-soulbound-detail-popup/token-soulbound-detail-popup.component';

@Component({
  selector: 'app-soulbound-feature-tokens',
  templateUrl: './soulbound-feature-tokens.component.html',
  styleUrls: ['./soulbound-feature-tokens.component.scss'],
})
export class SoulboundFeatureTokensComponent implements OnInit {
  @Input() extend = true;
  @Input() accountAddress = null;
  @Input() soulboundListData = null;
  @Output() totalSBT = new EventEmitter<number>();

  isClick = false;
  soulboundList = [];
  sbType = SB_TYPE;
  wallet = null;

  constructor(
    private soulboundService: SoulboundService,
    public commonService: CommonService,
    private dialog: MatDialog,
    private walletService: WalletService,
  ) {
    this.walletService.wallet$.subscribe((wallet) => {
      this.wallet = wallet?.bech32Address;
      if (!this.soulboundListData) {
        this.getSBTPick(this.wallet);
      } else {
        this.soulboundList = this.soulboundListData;
      }
    });
  }

  ngOnInit(): void {}

  getSBTPick(address = null) {
    const payload = {
      receiverAddress: address || this.accountAddress,
      limit: LIMIT_NUM_SBT,
    };

    this.soulboundService.getSBTPick(payload).subscribe((res) => {
      if (this.wallet !== this.accountAddress) {
        res.data = res.data.filter((k) => k.picked === true);
      }
      this.soulboundList = res.data;
      this.totalSBT.emit(res.meta.count);
    });
  }

  replaceImgIpfs(value) {
    return 'https://ipfs.io/' + value.replace('://', '/');
  }

  getSBTDetail(tokenID) {
    const encoded = encodeURIComponent(tokenID);
    this.isClick = true;
    this.soulboundService.getSBTDetail(encoded).subscribe((res) => {
      this.isClick = false;
      if (res) {
        this.openDialogDetail(res);
      }
    });
  }

  openDialogDetail(SBT) {
    let dialogRef = this.dialog.open(TokenSoulboundDetailPopupComponent, {
      panelClass: 'TokenSoulboundDetailPopup',
      data: SBT,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== 'canceled') {
      }
    });
  }

  linkSBDetail(contractAddress, tokenID) {
    let encode = encodeURIComponent(tokenID);
    window.location.href = `/tokens/token-nft/${contractAddress}/${encode}`;
  }
}
