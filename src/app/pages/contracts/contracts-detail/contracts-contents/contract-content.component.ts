import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { isContract } from 'src/app/core/utils/common/validation';
import { convertDataTransaction } from 'src/app/global/global';
import { CONTRACT_TAB, CONTRACT_TABLE_TEMPLATES } from '../../../../core/constants/contract.constant';
import { ContractTab, ContractVerifyType } from '../../../../core/constants/contract.enum';
import { Location } from '@angular/common';
@Component({
  selector: 'app-contract-content[contractsAddress]',
  templateUrl: './contract-content.component.html',
  styleUrls: ['./contract-content.component.scss'],
})
export class ContractContentComponent implements OnInit, OnDestroy {
  @Input() contractsAddress = '';
  @Input() contractTypeData: ContractVerifyType;

  TABS = CONTRACT_TAB.filter((tab) => [ContractTab.Transactions, ContractTab.Contract].includes(tab.key)).map(
    (tab) => ({
      ...tab,
      value: tab.value,
      key: tab.key === ContractTab.Transactions ? '' : tab.key,
    }),
  );

  countCurrent: string = ContractTab.Transactions;
  contractTab = ContractTab;
  contractVerifyType = ContractVerifyType;
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
  dataInstantiate = [];
  loadingContract = true;

  destroyed$ = new Subject<void>();
  timerGetUpTime: any;

  coinInfo = this.environmentService.configValue.chain_info.currencies[0];

  constructor(
    private contractService: ContractService,
    private transactionService: TransactionService,
    private router: Router,
    private aRoute: ActivatedRoute,
    private environmentService: EnvironmentService,
    private location: Location,
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
    this.destroyed$.next();
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
      this.getTransaction(false);
    }, 5000);
  }

  changeTab(tabId): void {
    tabId = tabId || 'transactions';
    this.location.replaceState('/contracts/' + this.contractInfo.contractsAddress + '?tabId=' + tabId);
    this.countCurrent = tabId;
  }

  getTransaction(isInit = true): void {
    if (isContract(this.contractsAddress)) {
      const payload = {
        limit: this.limit,
        value: this.contractsAddress,
        key: '_contract_address',
      };
      this.transactionService.getListTxCondition(payload).subscribe(
        (res) => {
          const data = res;
          if (res) {
            const txsExecute = convertDataTransaction(data, this.coinInfo);
            if (res?.transaction?.length > 0) {
              this.contractTransaction['data'] = txsExecute;
              this.contractTransaction['count'] = this.contractTransaction['data'].length || 0;
            }

            if (!isInit && this.dataInstantiate?.length > 0) {
              this.contractTransaction['data'] = [...this.contractTransaction['data'], this.dataInstantiate[0]];
              this.contractTransaction['count'] = this.contractTransaction['count'] + this.dataInstantiate?.length;
            }
          }
        },
        () => {},
        () => {
          this.loadingContract = false;
        },
      );
    } else {
      this.loadingContract = false;
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
