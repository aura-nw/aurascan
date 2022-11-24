import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-token-soulbound-account-token-list',
  templateUrl: './token-soulbound-account-token-list.component.html',
  styleUrls: ['./token-soulbound-account-token-list.component.scss']
})
export class TokenSoulboundAccountTokenListComponent implements OnInit {
  tokenAddress;
  modalReference: any;
  soulboundFeatureList = [
    {
      img: 'assets/images/soulboundToken.png',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0yta22'
    },
    {
      img: 'assets/images/soulboundToken.png',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0yta22'
    },
    {
      img: 'assets/images/soulboundToken.png',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0yta22'
    },
    {
      img: 'assets/images/soulboundToken.png',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0yta22'
    },
    {
      img: 'assets/images/soulboundToken.png',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0yta22'
    }
  ]
  activeId = 0;
  TABS = [
    {
      key: 0,
      value: 'Equipped'
    },
    {
      key: 1,
      value: 'Unequipped'
    }
  ]
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.tokenAddress = this.route.snapshot.paramMap.get('address');
    if(!this.tokenAddress || (this.tokenAddress && this.tokenAddress.trim().length === 0)) {
      this.router.navigate(['/']);
    }
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
