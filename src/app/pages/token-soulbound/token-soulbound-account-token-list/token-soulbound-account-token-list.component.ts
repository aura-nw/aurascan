import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SB_TYPE } from 'src/app/core/constants/soulbound.constant';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { WalletService } from 'src/app/core/services/wallet.service';

@Component({
  selector: 'app-token-soulbound-account-token-list',
  templateUrl: './token-soulbound-account-token-list.component.html',
  styleUrls: ['./token-soulbound-account-token-list.component.scss'],
})
export class TokenSoulboundAccountTokenListComponent implements OnInit {
  userAddress = '';
  modalReference: any;
  totalSBT = 0;
  soulboundFeatureList = [];
  activeId = 0;
  walletAddress = '';
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
      if (wallet) {
        if (wallet?.bech32Address !== this.userAddress) {
          this.TABS = this.TAB_EQUIPPED;
        } else {
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
}
