import { Component, OnInit } from '@angular/core';
import { CONTRACT_TAB, MAX_LENGTH_SEARCH_CONTRACT } from '../../../../core/constants/contract.constant';
import { ContractTab } from '../../../../core/constants/contract.enum';
@Component({
  selector: 'app-contract-content',
  templateUrl: './contract-content.component.html',
  styleUrls: ['./contract-content.component.scss'],
})
export class ContractContentComponent implements OnInit {
  TABS = CONTRACT_TAB.filter((vote) =>
    [ContractTab.Transactions, ContractTab.Cw20Token, ContractTab.Contract, ContractTab.Events, ContractTab.Analytics].includes(vote.key),
  ).map((vote) => ({
    ...vote,
    value: vote.value,
    key: vote.key === ContractTab.Transactions ? '' : vote.key,
  }));
  countCurrent: string = '';
  textSearch: string = '';
  searchTemp: string = '';
  isSearchTx = false;
  isSearchAddres = false;
  resultSearch = 0;
  tabsBackup = this.TABS;
  contractTab = ContractTab;
  maxLengthSearch = MAX_LENGTH_SEARCH_CONTRACT;

  constructor() {}

  ngOnInit(): void {}

  changeTab(tabId): void {
    this.countCurrent = tabId;
  }

  getLength(result: string) {
    this.resultSearch = Number(result) || 0;
  }
}
