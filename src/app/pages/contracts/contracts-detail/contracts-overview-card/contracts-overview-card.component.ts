import { Component, Input, OnInit } from '@angular/core';
import { TYPE_ACCOUNT } from 'src/app/core/constants/account.constant';
import { Globals } from '../../../../global/global';

@Component({
  selector: 'app-contracts-overview-card',
  templateUrl: './contracts-overview-card.component.html',
  styleUrls: ['./contracts-overview-card.component.scss']
})
export class ContractsOverviewCardComponent implements OnInit {
  @Input() contractDetail: any;
  selectedToken: any;
  assetsType = TYPE_ACCOUNT;
  constructor(public global: Globals) { }

  ngOnInit(): void {
  }
}
