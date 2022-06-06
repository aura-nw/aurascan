import { Component, Input, OnInit } from '@angular/core';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { ContractType } from '../../../../../../core/constants/token.enum';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss'],
})
export class ContractComponent implements OnInit {
  @Input() contractTypeData: string;
  @Input() contractsAddress: string;

  contractType = ContractType;
  countCurrent = this.contractType.Code;
  isVerifyContract = false;
  contractVerifyType = ContractVerifyType;
  constructor() { }

  ngOnInit(): void {
    console.log(this.contractsAddress)
    this.isVerifyContract = true;
  }

  changeTab(tabId): void {
    this.countCurrent = tabId;
  }
}
