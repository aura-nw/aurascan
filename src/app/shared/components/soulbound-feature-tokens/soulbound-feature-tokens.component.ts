import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LIMIT_NUM_SBT, SB_TYPE } from 'src/app/core/constants/soulbound.constant';
import { CommonService } from 'src/app/core/services/common.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { TokenSoulboundDetailPopupComponent } from 'src/app/pages/token-soulbound/token-soulbound-detail-popup/token-soulbound-detail-popup.component';

@Component({
  selector: 'app-soulbound-feature-tokens',
  templateUrl: './soulbound-feature-tokens.component.html',
  styleUrls: ['./soulbound-feature-tokens.component.scss'],
})
export class SoulboundFeatureTokensComponent implements OnInit {
  @Input() extend = true;
  @Input() accountAddress;
  @Output() totalSBT = new EventEmitter<number>();

  isClick = false;
  soulboundList = [];
  sbType = SB_TYPE;

  constructor(
    private soulboundService: SoulboundService,
    public commonService: CommonService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.getSBTPick();
  }

  getSBTPick() {
    const payload = {
      receiverAddress: this.accountAddress,
      limit: LIMIT_NUM_SBT,
    };

    this.soulboundService.getSBTPick(payload).subscribe((res) => {
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
