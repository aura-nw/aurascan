import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { STORAGE_KEYS } from 'src/app/core/constants/common.constant';
import { ContractService } from 'src/app/core/services/contract.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { WSService } from 'src/app/core/services/ws.service';
import { checkTypeFile } from 'src/app/core/utils/common/info-common';
import local from 'src/app/core/utils/storage/local';
import { SoulboundTokenDetailPopupComponent } from 'src/app/pages/soulbound-token/soulbound-token-detail-popup/soulbound-token-detail-popup.component';

@Component({
  selector: 'app-soulbound-feature-tokens',
  templateUrl: './soulbound-feature-tokens.component.html',
  styleUrls: ['./soulbound-feature-tokens.component.scss'],
})
export class SoulboundFeatureTokensComponent implements OnInit {
  @Input() reloadAPI: boolean = true;
  @Input() extend = true;
  @Input() accountAddress = null;
  @Input() soulboundListData = null;
  @Input() displayManage = false;
  @Input() isSBTValidator = false;
  @Input() isAccountDetail = false;
  @Output() totalSBTPick = new EventEmitter<number>();
  @Output() closeDlg = new EventEmitter<number>();
  @Output() totalNotify = new EventEmitter<number>();

  isClick = false;
  soulboundList = [];
  totalABT = 0;
  soulboundUnclaimedNum = 0;
  wallet = null;
  userAddress = null;
  timerGetUpTime: any;
  isLoading = true;
  sbtClass = '';
  sbtPage = false;

  constructor(
    private soulboundService: SoulboundService,
    private dialog: MatDialog,
    private walletService: WalletService,
    private router: ActivatedRoute,
    private contractService: ContractService,
    private wSService: WSService,
    private route: Router,
  ) {}

  ngOnInit(): void {
    if (this.route.url.includes('accountbound')) {
      this.sbtClass = 'sbt-page';
      this.sbtPage = true;
    }

    this.userAddress = this.router.snapshot.paramMap.get('address');
    this.walletService.walletAccount$.subscribe((wallet) => {
      this.soulboundUnclaimedNum = 0;
      this.wallet = wallet?.address;
      this.getABTNotify();
      this.getData();
      if (this.reloadAPI) {
        this.timerGetUpTime = setInterval(() => {
          this.getData();
        }, 30000);
      }
    });

    this.wSService.getNotifyValue.subscribe((res) => {
      this.soulboundUnclaimedNum = res;
      this.totalNotify.emit(this.soulboundUnclaimedNum);
    });
  }

  ngOnDestroy(): void {
    if (this.timerGetUpTime) {
      clearInterval(this.timerGetUpTime);
    }
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
    const payload = {
      limit: 100,
      offset: 0,
      receiverAddress: this.userAddress,
      isEquipToken: true,
    };

    this.soulboundService.getListSoulboundByAddress(payload).subscribe(
      (res) => {
        this.totalABT = res.meta.count;
        res.data = res.data.filter((k) => k.picked);
        this.soulboundList = res.data;
        this.totalSBTPick.emit(res.meta.count);
      },
      () => {
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      },
    );
  }

  getSBTDetail(contractAddress, tokenID) {
    this.isClick = true;
    this.contractService.getDetailCW4973(contractAddress, tokenID).subscribe((res) => {
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
    window.location.href = `/token/${contractAddress}/${encode}`;
  }

  getTypeFile(nft: any) {
    let nftType = checkTypeFile(nft);
    return nftType;
  }

  getABTNotify(): void {
    this.soulboundService.getNotify(this.wallet).subscribe(
      (res) => {
        this.soulboundUnclaimedNum = res.data?.notify || 0;
        this.totalNotify.emit(this.soulboundUnclaimedNum);
      },
      () => {},
      () => {
        this.isLoading = false;
      },
    );

    this.wSService.subscribeABTNotify(
      () => {},
      () => {},
    );
  }

  setLinkTab() {
    if (this.soulboundUnclaimedNum > 0 && this.wallet === this.userAddress) {
      local.setItem(STORAGE_KEYS.TAB_UNEQUIP, 'true');
    }
  }
}
