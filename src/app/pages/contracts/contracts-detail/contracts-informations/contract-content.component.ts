import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { TableTemplate } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { isContract } from 'src/app/core/utils/common/validation';
import { TableData } from 'src/app/shared/components/table/table.component';
import { CONTRACT_TAB, MAX_LENGTH_SEARCH_CONTRACT } from '../../../../core/constants/contract.constant';
import { ContractTab } from '../../../../core/constants/contract.enum';
@Component({
  selector: 'app-contract-content',
  templateUrl: './contract-content.component.html',
  styleUrls: ['./contract-content.component.scss'],
})
export class ContractContentComponent implements OnInit {
  contractsAddress = 'aura1fvldjhf9jr7wrluxzvrkjnt6av4r0uzpmjhe3ejp7cnd0s2rsufsfqxj53';

  TABS = CONTRACT_TAB.filter((vote) =>
    [
      ContractTab.Transactions,
      ContractTab.Cw20Token,
      ContractTab.Contract,
      ContractTab.Events,
      ContractTab.Analytics,
    ].includes(vote.key),
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
    { matColumnDef: 'txHash', headerCellDef: 'Txn Hash', type: 'hash-url', isUrl: '/transaction' },
    { matColumnDef: 'method', headerCellDef: 'Method', type: 'status', headerWidth: 10 },
    { matColumnDef: 'block', headerCellDef: 'Blocks', type: 'hash-url', headerWidth: 8, isUrl: '/blocks' },
    { matColumnDef: 'time', headerCellDef: 'Time', type: 'time-distance', headerWidth: 10, suffix: 'ago' },
    { matColumnDef: 'from', headerCellDef: 'From', type: 'hash-url', headerWidth: 15, isUrl: '/account' },
    { matColumnDef: 'label', headerCellDef: '', type: 'status', headerWidth: 8, justify: 'center' },
    { matColumnDef: 'to', headerCellDef: 'To', type: 'hash-url', headerWidth: 15, isUrl: '/account' },
    { matColumnDef: 'value', headerCellDef: 'Value', type: 'numb', suffix: 'Aura', headerWidth: 10 },
    { matColumnDef: 'fee', headerCellDef: 'Fee', type: 'numb', headerWidth: 10 },
  ];

  contractTransaction: TableData[] = [];

  contractInfo = {
    contractsAddress: this.contractsAddress,
    count: 0,
    viewAll: true,
  };

  constructor(private contractService: ContractService) {}

  ngOnInit(): void {
    this.getTransaction();
  }

  changeTab(tabId): void {
    this.countCurrent = tabId;
  }

  getLength(result: string) {
    this.resultSearch = Number(result) || 0;
  }

  getTransaction(): void {
    if (isContract(this.contractsAddress)) {
      this.contractService.getTransactions(this.contractsAddress).subscribe((res) => {
        console.log(res);
        if (res.data && Array.isArray(res.data)) {
          this.contractInfo.count = res.meta.count || 0;
          const ret = res.data.map((contract) => {
            const method = Object.keys(contract.messages[0].msg)[0];
            const value = +contract.messages[0].funds[0]?.amount || 0;

            const label = contract.messages[0].sender === this.contractsAddress ? 'OUT' : 'TO';

            const tableDta: TableData = {
              txHash: contract.tx_hash,
              method,
              block: contract.blockId,
              time: new Date(contract.timestamp),
              from: contract.messages[0].sender,
              label,
              to: contract.messages[0].contract,
              value,
              fee: +contract.fee,
            };

            return tableDta;
          });

          console.log(ret);

          this.contractTransaction = ret;
        }
      });
    }
  }
}
