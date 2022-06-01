import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { TableTemplate } from 'src/app/core/models/common.model';
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

  mockData: {
    txHash: string;
    method: string;
    block: number;
    time: Date;
    from: string;
    to: string;
    label: string;
    value: number;
    fee: number;
  }[] = [
    {
      txHash: 'DCE3D1C7FDCD2A620940DE97235A4D484C769486493B51ECC3E06BF0DBE9D5C8',
      method: 'Transfer',
      block: 2722076,
      time: moment().subtract(100, 's').toDate(),
      from: 'DCE3D1C7FDCD2A620940DE97235A4D484C769486493B51ECC3E06BF0DBE9D5C8',
      to: 'DCE3D1C7FDCD2A620940DE97235A4D484C769486493B51ECC3E06BF0DBE9D5C8',
      label: 'TO',
      value: 123.123,
      fee: 2.134,
    },
    {
      txHash: 'DCE3D1C7FDCD2A620940DE97235A4D484C769486493B51ECC3E06BF0DBE9D5C8',
      method: 'Transfer',
      block: 2722076,
      time: moment().subtract(100, 'm').toDate(),
      from: 'DCE3D1C7FDCD2A620940DE97235A4D484C769486493B51ECC3E06BF0DBE9D5C8',
      to: 'DCE3D1C7FDCD2A620940DE97235A4D484C769486493B51ECC3E06BF0DBE9D5C8',
      label: 'OUT',
      value: 123.123,
      fee: 2.134,
    },
  ];

  templates: Array<TableTemplate> = [
    { matColumnDef: 'txHash', headerCellDef: 'Txn Hash', type: 'hash-url' },
    { matColumnDef: 'method', headerCellDef: 'Method', type: 'status', headerWidth: 10 },
    { matColumnDef: 'block', headerCellDef: 'Blocks', type: 'hash-url', headerWidth: 8, isUrl: '/block' },
    { matColumnDef: 'time', headerCellDef: 'Time', type: 'time-distance', headerWidth: 10 },
    { matColumnDef: 'from', headerCellDef: 'From', type: 'hash-url', headerWidth: 15 },
    { matColumnDef: 'label', headerCellDef: '', type: 'status', headerWidth: 8, justify: 'center' },
    { matColumnDef: 'to', headerCellDef: 'To', type: 'hash-url', headerWidth: 15 },
    { matColumnDef: 'value', headerCellDef: 'Value', type: 'numb', suffix: 'Aura', headerWidth: 10 },
    { matColumnDef: 'fee', headerCellDef: 'Fee', type: 'numb', headerWidth: 10 },
  ];

  contractInfo = {
    contractsAddress: 'aura1gp7qcchk3y8emexal0r0s2txc94fkhnywslp2wnc3qcd8ng0wtys9aq24r',
    count: 21231231,
    viewAll: true
  };
  constructor() {}

  ngOnInit(): void {}

  changeTab(tabId): void {
    this.countCurrent = tabId;
  }

  getLength(result: string) {
    this.resultSearch = Number(result) || 0;
  }
}
