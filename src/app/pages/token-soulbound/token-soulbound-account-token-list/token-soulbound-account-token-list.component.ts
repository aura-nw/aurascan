import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
  TABS = [
    {
      key: 0,
      value: 'Equipped',
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
        this.walletAddress = wallet.bech32Address;
        // if (this.userAddress === this.walletAddress) {
          this.TABS.push({ key: 1, value: 'Unequipped' });
        // }
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
