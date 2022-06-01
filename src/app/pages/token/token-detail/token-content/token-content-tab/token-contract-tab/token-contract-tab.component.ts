import { Component, OnInit } from '@angular/core';
import { TokenContractType } from '../../../../../../core/constants/smart-contract.enum';

@Component({
  selector: 'app-token-contract-tab',
  templateUrl: './token-contract-tab.component.html',
  styleUrls: ['./token-contract-tab.component.scss']
})
export class TokenContractTabComponent implements OnInit {
  contractType = TokenContractType;
  countCurrent = this.contractType.ReadContract;
  constructor() { }

  ngOnInit(): void {
  }

  changeTab(tabId): void {
    this.countCurrent = tabId;
  }
}
