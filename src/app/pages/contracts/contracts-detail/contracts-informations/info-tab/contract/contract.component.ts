import { Component, OnInit } from '@angular/core';
import { ContractType } from '../../../../../../core/constants/token.enum';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss']
})
export class ContractComponent implements OnInit {
  contractType = ContractType;
  countCurrent = this.contractType.Code;
  isVerifyContract = false;
  constructor() { }

  ngOnInit(): void {
    this.isVerifyContract = true;
  }

  changeTab(tabId): void {
    this.countCurrent = tabId;
  }
}
