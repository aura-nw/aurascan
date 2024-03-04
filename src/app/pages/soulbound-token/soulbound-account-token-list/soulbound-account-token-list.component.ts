import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ENameTag } from 'src/app/core/constants/account.enum';
import { STORAGE_KEYS } from 'src/app/core/constants/common.constant';
import { LIMIT_NUM_SBT, SB_TYPE } from 'src/app/core/constants/soulbound.constant';
import { CommonService } from 'src/app/core/services/common.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import local from 'src/app/core/utils/storage/local';

@Component({
  selector: 'app-soulbound-account-token-list',
  templateUrl: './soulbound-account-token-list.component.html',
  styleUrls: ['./soulbound-account-token-list.component.scss'],
})
export class SoulboundAccountTokenListComponent implements OnInit {
  userAddress = '';
  modalReference: any;
  totalSBT = 0;
  totalPick = 0;
  activeId = 0;
  TABS = [];
  TAB_EQUIPPED = [
    {
      key: 0,
      value: SB_TYPE.EQUIPPED,
    },
  ];
  TAB_ALL = [
    {
      key: 0,
      value: SB_TYPE.EQUIPPED,
    },
    {
      key: 1,
      value: SB_TYPE.UNEQUIPPED,
    },
  ];
  reloadAPI = false;
  totalNotify = 0;
  ENameTag = ENameTag;

  constructor(
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private walletService: WalletService,
    private cdr: ChangeDetectorRef,
    private soulboundService: SoulboundService,
    public commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.userAddress = this.route.snapshot.paramMap.get('address');
    this.walletService.walletAccount$.subscribe((wallet) => {
      this.TABS = this.TAB_EQUIPPED;
      if (wallet) {
        if (wallet?.address === this.userAddress) {
          this.TABS = this.TAB_ALL;
        }
      }
    });

    if (local.getItem(STORAGE_KEYS.TAB_UNEQUIP) == 'true') {
      this.activeId = 1;
      local.removeItem(STORAGE_KEYS.TAB_UNEQUIP);
    }
    this.getSBTPick();
  }

  viewQrAddress(staticDataModal: any): void {
    this.modalReference = this.modalService.open(staticDataModal, {
      keyboard: false,
      centered: true,
      size: 'sm',
      windowClass: 'modal-holder contact-qr-modal',
    });
  }

  closePopup() {
    this.modalReference.close();
  }

  changeTab(key) {
    this.activeId = key;
    this.reloadAPI = false;
  }

  totalNotifyEmitHandle(evt) {
    this.totalNotify = evt;
    this.reloadAPI = true;
    this.cdr.markForCheck();
  }

  getABTNotify(): void {
    this.soulboundService.getNotify(this.walletService.walletAccount?.address).subscribe((res) => {
      this.totalNotify = res.data.notify || 0;
    });
  }

  getSBTPick() {
    const payload = {
      receiverAddress: this.userAddress,
      limit: LIMIT_NUM_SBT,
    };

    this.soulboundService.getSBTPick(payload).subscribe((res) => {
      this.totalPick = res.data.length;
    });
  }
}
