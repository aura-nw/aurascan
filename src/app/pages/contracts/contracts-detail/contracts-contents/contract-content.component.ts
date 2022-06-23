import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableTemplate } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { isContract } from 'src/app/core/utils/common/validation';
import { CONTRACT_TAB, CONTRACT_TABLE_TEMPLATES } from '../../../../core/constants/contract.constant';
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
  contractTab = ContractTab;
  contractVerifyType = ContractVerifyType;
  isVerifyContract = false;
  contractTransaction;
  templates: Array<TableTemplate> = CONTRACT_TABLE_TEMPLATES;

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
          this.contractTransaction = res;
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
