import { Component, Input, OnInit } from '@angular/core';
import { TableTemplate } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { isContract } from 'src/app/core/utils/common/validation';
import { TableData } from 'src/app/shared/components/contract-table/contract-table.component';
import {
  CONTRACT_TAB,
  CONTRACT_TABLE_TEMPLATES,
  MAX_LENGTH_SEARCH_CONTRACT,
} from '../../../../core/constants/contract.constant';
import { ContractTab, ContractVerifyType } from '../../../../core/constants/contract.enum';
@Component({
  selector: 'app-contract-content[contractsAddress]',
  templateUrl: './contract-content.component.html',
  styleUrls: ['./contract-content.component.scss'],
})
export class ContractContentComponent implements OnInit {
  @Input() contractsAddress = '';
  @Input() contractTypeData: ContractVerifyType;

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
  contractVerifyType = ContractVerifyType;
  isVerifyContract = false;

  templates: Array<TableTemplate> = CONTRACT_TABLE_TEMPLATES;

  contractTransaction: TableData[] = [];

  contractInfo = {
    contractsAddress: this.contractsAddress,
    count: 0,
    viewAll: true,
    popover: true,
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
        if (res.data && Array.isArray(res.data)) {
          this.contractInfo.count = res.meta.count || 0;
          const ret = res.data.map((contract) => {
            const method = Object.keys(contract.messages[0].msg)[0];
            const value = +contract.messages[0].funds[0]?.amount || 0;

            const label = contract.messages[0].sender === this.contractsAddress ? 'OUT' : 'TO';

            const tableDta: TableData = {
              txHash: contract.tx_hash,
              method,
              blockHeight: contract.height,
              blockId: contract.blockId,
              time: new Date(contract.timestamp),
              from: contract.messages[0].sender,
              label,
              to: contract.messages[0].contract,
              value,
              fee: +contract.fee,
            };

            return tableDta;
          });

          this.contractTransaction = ret;
          if (this.contractTypeData !== this.contractVerifyType.Unverifed) {
            this.isVerifyContract = true;
          }
        }
      });
    }
  }
}
