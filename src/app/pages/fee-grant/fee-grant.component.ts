import { Component, OnInit } from '@angular/core';
import { WalletService } from 'src/app/core/services/wallet.service';

@Component({
  selector: 'app-fee-grant',
  templateUrl: './fee-grant.component.html',
  styleUrls: ['./fee-grant.component.scss'],
})
export class FeeGrantComponent implements OnInit {
  isGrantees = true;
  TAB = [
    {
      id: 0,
      value: 'My Grantees',
    },
    {
      id: 1,
      value: 'My Granters',
    },
  ];
  constructor(public walletService: WalletService) {}

  ngOnInit(): void {}

  changeType(type: boolean) {
    this.isGrantees = type;
  }
}
