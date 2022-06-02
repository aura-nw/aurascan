import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { TableTemplate } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { isContract } from 'src/app/core/utils/common/validation';
import { TableData } from 'src/app/shared/components/table/table.component';
import { CONTRACT_TAB, MAX_LENGTH_SEARCH_CONTRACT } from '../../../../core/constants/contract.constant';
import { ContractTab } from '../../../../core/constants/contract.enum';
@Component({
  selector: 'app-contract-content[contractsAddress]',
  templateUrl: './contract-content.component.html',
  styleUrls: ['./contract-content.component.scss'],
})
export class ContractContentComponent implements OnInit {
  @Input() contractsAddress = '';

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

  templates: Array<TableTemplate> = [
    { matColumnDef: 'txHash', headerCellDef: 'Txn Hash', type: 'hash-url', isUrl: '/transaction' },
    { matColumnDef: 'method', headerCellDef: 'Method', type: 'status', headerWidth: 10 },
    { matColumnDef: 'block', headerCellDef: 'Blocks', type: 'hash-url', headerWidth: 8, isUrl: '/blocks/id' },
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
    this.contractInfo.contractsAddress = this.contractsAddress;

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
