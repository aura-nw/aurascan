import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TRANSACTION_TYPE_ENUM } from 'src/app/core/constants/transaction.enum';
import { TableTemplate } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { balanceOf } from 'src/app/core/utils/common/parsing';
import { isContract } from 'src/app/core/utils/common/validation';
import { TableData } from 'src/app/shared/components/contract-table/contract-table.component';
import {
  CONTRACT_TAB,
  CONTRACT_TABLE_TEMPLATES,
  MAX_LENGTH_SEARCH_CONTRACT,
} from '../../../../core/constants/contract.constant';
import { ContractTab, ContractTransactionType, ContractVerifyType } from '../../../../core/constants/contract.enum';
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
  resultSearch = 0;
  contractTab = ContractTab;
  maxLengthSearch = MAX_LENGTH_SEARCH_CONTRACT;
  contractVerifyType = ContractVerifyType;
  contractTransactionType = ContractTransactionType;
  isVerifyContract = false;

  templates: Array<TableTemplate> = CONTRACT_TABLE_TEMPLATES;

  contractTransaction: TableData[] = [];

  contractInfo = {
    contractsAddress: this.contractsAddress,
    count: 0,
    viewAll: true,
    popover: true,
  };

  constructor(private contractService: ContractService, private router: Router, private aRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.contractInfo.contractsAddress = this.contractsAddress;
    this.getTransaction();
  }

  changeTab(tabId): void {
    this.countCurrent = tabId;
  }

  getTransaction(): void {
    if (isContract(this.contractsAddress)) {
      let payload = {
        limit: 25,
        offset: 0,
        label: '',
        contract_address: this.contractsAddress,
      };

      this.contractService.getTransactions(payload).subscribe((res) => {
        if (res.data && Array.isArray(res.data)) {
          this.contractInfo.count = res.meta.count || 0;
          let value = 0;
          let from = '';
          let to = '';
          const ret = res.data.map((contract) => {
            let method = '';
            switch (contract.type) {
              case TRANSACTION_TYPE_ENUM.InstantiateContract:
                method = 'instantiate';
                break;
              case TRANSACTION_TYPE_ENUM.Send:
                method = 'transfer';
                value = +contract.messages[0]?.amount[0].amount;
                from = contract.messages[0].from_address;
                to = contract.messages[0].to_address;
                break;
              default:
                method = Object.keys(contract.messages[0].msg)[0];
                value = +contract.messages[0].funds[0]?.amount || 0;
                from = contract.messages[0].sender;
                to = contract.messages[0].contract;
                break;
            }

            const label =
              contract.messages[0].sender === this.contractsAddress
                ? ContractTransactionType.OUT
                : ContractTransactionType.IN;

            const tableDta: TableData = {
              txHash: contract.tx_hash,
              method,
              blockHeight: contract.height,
              blockId: contract.blockId,
              time: new Date(contract.timestamp),
              from,
              label,
              to,
              value: balanceOf(value),
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

  filterTransaction(event): void {
    if (event?.key) {
      this.router.navigate([`/contracts/transactions`, this.contractsAddress], {
        queryParams: {
          label: event.key,
        },
      });
    } else {
      this.router.navigate([`/contracts/transactions`, this.contractsAddress]);
    }
  }
}
