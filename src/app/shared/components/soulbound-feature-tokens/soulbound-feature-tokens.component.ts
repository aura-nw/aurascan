import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { LIMIT_NUM_SBT, SB_TYPE } from 'src/app/core/constants/soulbound.constant';
import { CommonService } from 'src/app/core/services/common.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { checkTypeFile } from 'src/app/core/utils/common/info-common';
import { SoulboundTokenDetailPopupComponent } from 'src/app/pages/soulbound-token/soulbound-token-detail-popup/soulbound-token-detail-popup.component';

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
  @Output() totalPick = new EventEmitter<number>();
  @Output() closeDlg = new EventEmitter<number>();

  isClick = false;
  soulboundList = [];
  wallet = null;
  userAddress = null;
  timerGetUpTime: any;

  constructor(
    private soulboundService: SoulboundService,
    public commonService: CommonService,
    private dialog: MatDialog,
    private walletService: WalletService,
    private router: ActivatedRoute,
    private contractService: ContractService,
  ) {}

  ngOnInit(): void {
    this.userAddress = this.router.snapshot.paramMap.get('address');
    this.walletService.wallet$.subscribe((wallet) => {
      this.wallet = wallet?.bech32Address;
      this.getData();
      this.timerGetUpTime = setInterval(() => {
        this.getData();
      }, 30000);
    });
  }

  getData() {
    if (this.soulboundListData) {
      this.soulboundList = this.soulboundListData;
    } else {
      setTimeout(() => {
        this.getSBTPick();
      }, 1000);
    }
  }

  getSBTPick() {
    let address = this.accountAddress || this.userAddress;
    const payload = {
      receiverAddress: address,
      limit: LIMIT_NUM_SBT,
    };

    this.soulboundService.getSBTPick(payload).subscribe((res) => {
      if (this.wallet !== address) {
        res.data = res.data.filter((k) => k.picked);
      }
      this.soulboundList = res.data;
      this.totalSBT.emit(res.meta.count);
      this.totalPick.emit(res.data?.length || 0);
    });
  }

  getSBTDetail(contractAddress, tokenID) {
    this.isClick = true;
    this.contractService.getNFTDetail(contractAddress, tokenID).subscribe((res) => {
      this.isClick = false;
      if (res) {
        this.openDialogDetail(res.data);
      }
    });
  }

  openDialogDetail(SBT) {
    let dialogRef = this.dialog.open(SoulboundTokenDetailPopupComponent, {
      panelClass: 'TokenSoulboundDetailPopup',
      data: SBT,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== 'canceled') {
        this.closeDlg.emit();
      }
    });
  }

  linkSBDetail(contractAddress, tokenID) {
    let encode = encodeURIComponent(tokenID);
    window.location.href = `/tokens/token-abt/${contractAddress}/${encode}`;
  }

  getTypeFile(nft: any) {
    let nftType = checkTypeFile(nft);
    return nftType;
  }
}
