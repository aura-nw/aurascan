import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { isContract } from 'src/app/core/utils/common/validation';
import { convertDataTransaction } from 'src/app/global/global';
import { CONTRACT_TAB, CONTRACT_TABLE_TEMPLATES } from '../../../../core/constants/contract.constant';
import { ContractTab, ContractVerifyType } from '../../../../core/constants/contract.enum';

@Component({
  selector: 'app-contract-content[contractsAddress]',
  templateUrl: './contract-content.component.html',
  styleUrls: ['./contract-content.component.scss'],
})
export class ContractContentComponent implements OnInit, OnDestroy {
  @Input() contractsAddress = '';
  @Input() contractTypeData: ContractVerifyType;

  TABS = CONTRACT_TAB.filter((tab) =>
    [
      ContractTab.Transactions,
      // ContractTab.Cw20Token,
      ContractTab.Contract,
      // ContractTab.Events,
      // ContractTab.Analytics,
    ].includes(tab.key),
  ).map((tab) => ({
    ...tab,
    value: tab.value,
    key: tab.key === ContractTab.Transactions ? '' : tab.key,
  }));

  countCurrent: string = ContractTab.Transactions;
  contractTab = ContractTab;
  contractVerifyType = ContractVerifyType;
  nextKey = null;
  activeId = 0;
  limit = 25;
  contractTransaction = {};
  templates: Array<TableTemplate> = CONTRACT_TABLE_TEMPLATES;

  contractInfo = {
    contractsAddress: this.contractsAddress,
    count: 0,
    viewAll: true,
    popover: true,
  };

  destroyed$ = new Subject();
  timerGetUpTime: any;

  coinInfo = this.environmentService.configValue.chain_info.currencies[0];

  constructor(
    private contractService: ContractService,
    private router: Router,
    private aRoute: ActivatedRoute,
    private environmentService: EnvironmentService,
  ) {
    const valueColumn = this.templates.find((item) => item.matColumnDef === 'value');

    valueColumn &&
      ((v) => {
        v.suffix =
          `<span class="text--primary">` +
          this.environmentService.configValue.chain_info.currencies[0].coinDenom +
          `</span>`;
      })(valueColumn);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();

    if (this.timerGetUpTime) {
      clearInterval(this.timerGetUpTime);
    }
  }

  ngOnInit(): void {
    this.contractInfo.contractsAddress = this.contractsAddress;
    this.getTransaction();

    this.aRoute.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((params) => {
      const { tabId } = params;
      if (tabId && Object.values(ContractTab).includes(tabId as ContractTab)) {
        this.countCurrent = tabId as ContractTab;
        const _tabId = this.TABS.findIndex((tab) => tab.key === tabId);
        this.activeId = _tabId >= 0 ? _tabId : 0;

        if (tabId === ContractTab.Contract) {
          const reload = this.router.getCurrentNavigation()?.extras?.state?.reload;

          if (reload) {
            this.contractService.loadContractDetail(this.contractsAddress);
          }
        }
      } else {
        this.countCurrent = ContractTab.Transactions;
        this.activeId = 0;
      }
    });

    this.timerGetUpTime = setInterval(() => {
      this.getTransaction();
    }, 30000);
  }

  changeTab(tabId): void {
    this.router.navigate([], {
      relativeTo: this.aRoute,
      queryParams: { tabId: tabId || ContractTab.Transactions },
      queryParamsHandling: 'merge',
    });
  }

  getTransaction(): void {
    if (isContract(this.contractsAddress)) {
      this.contractService
        .getTransactionsIndexer(this.limit, this.contractsAddress, 'execute')
        .subscribe((dataExecute) => {
          const { code, data } = dataExecute;
          this.nextKey = dataExecute.data.nextKey;
          if (code === 200) {
            const txsExecute = convertDataTransaction(data, this.coinInfo);
            if (dataExecute?.data.count > 0) {
              this.contractTransaction['data'] = txsExecute;
              this.contractTransaction['count'] = this.contractTransaction['data'].length || 0;
            }
            //check data < 25 record
            if (this.contractTransaction['data']?.length < this.limit || !this.contractTransaction['data']) {
              this.contractService
                .getTransactionsIndexer(this.limit, this.contractsAddress, 'instantiate')
                .subscribe((dataInstantiate) => {
                  if (dataInstantiate.data?.transactions?.length > 0) {
                    const txsInstantiate = convertDataTransaction(dataInstantiate.data, this.coinInfo);
                    txsInstantiate[0]['type'] =
                      dataInstantiate.data.transactions[0].tx_response.tx.body.messages[0]['@type'];
                    txsInstantiate[0]['contract_address'] = this.contractsAddress;
                    let data = [];
                    if (this.contractTransaction['data']?.length > 0) {
                      data = [...this.contractTransaction['data'], txsInstantiate[0]];
                    } else {
                      data = txsInstantiate;
                    }
                    let count = data.length || 0;
                    this.contractTransaction = {
                      data,
                      count,
                    };
                  }
                });
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
