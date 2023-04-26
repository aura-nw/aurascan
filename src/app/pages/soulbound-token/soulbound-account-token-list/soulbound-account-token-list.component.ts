import { ChangeDetectorRef, Component, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {LIMIT_NUM_SBT, SB_TYPE} from 'src/app/core/constants/soulbound.constant';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { WalletService } from 'src/app/core/services/wallet.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private walletService: WalletService,
    private cdr: ChangeDetectorRef,
    private soulboundService: SoulboundService,
  ) {}

  ngOnInit(): void {
    this.userAddress = this.route.snapshot.paramMap.get('address');

    if (!this.userAddress || (this.userAddress && this.userAddress.trim().length === 0)) {
      this.router.navigate(['/']);
    }

    this.walletService.wallet$.subscribe((wallet) => {
      this.TABS = this.TAB_EQUIPPED;
      if (wallet) {
        if (wallet?.bech32Address === this.userAddress) {
          this.TABS = this.TAB_ALL;
        }
      }
    });

    if (localStorage.getItem('tabUnEquip') == 'true') {
      this.activeId = 1;
      localStorage.setItem('tabUnEquip', null);
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

  copyMessage(text: string) {
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    // fake event click out side copy button
    // this event for hidden tooltip
    setTimeout(function () {
      document.getElementById('tokenAddress').click();
    }, 800);
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
    this.soulboundService.getNotify(this.walletService.wallet?.bech32Address).subscribe((res) => {
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
