import { Component, OnInit } from '@angular/core';
import { TokenContractType } from '../../../../../../core/constants/smart-contract.enum';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss']
})
export class ContractComponent implements OnInit {
  contractType = TokenContractType;
  countCurrent = this.contractType.ReadContract;
  constructor() { }

  ngOnInit(): void {
  }

  changeTab(tabId): void {
    this.countCurrent = tabId;
  }
}
