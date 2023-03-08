import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SB_TYPE } from 'src/app/core/constants/soulbound.constant';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private walletService: WalletService,
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
}
