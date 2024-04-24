import { Location } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
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
  @Input() contractId;

  TABS = CONTRACT_TAB.filter((tab) => [ContractTab.Transactions, ContractTab.Contract].includes(tab.key)).map(
    (tab) => ({
      ...tab,
      value: tab.value,
      key: tab.key === ContractTab.Transactions ? '' : tab.key,
    }),
  );

  currentTab: string = ContractTab.Transactions;
  contractTab = ContractTab;
  contractVerifyType = ContractVerifyType;
  activeId = 0;
  limit = 25;
  contractTransaction = { count: 0 };
  templates: Array<TableTemplate> = CONTRACT_TABLE_TEMPLATES;
  errTxt: string;
  contractInfo = {
    contractsAddress: this.contractsAddress,
    count: 0,
    viewAll: true,
    popover: true,
  };
  dataInstantiate = [];
  loadingContract = true;
  isFirstLoad = true;

  destroyed$ = new Subject<void>();
  timerGetUpTime: any;
  coinInfo = this.environmentService.chainInfo.currencies[0];

  constructor(
    private commonService: CommonService,
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
          `<span class="text--primary">` + this.environmentService.chainInfo.currencies[0].coinDenom + `</span>`;
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
    this.aRoute.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((params) => {
      const { tabId } = params;
      if (tabId && Object.values(ContractTab).includes(tabId as ContractTab)) {
        this.currentTab = tabId as ContractTab;
        const _tabId = this.TABS.findIndex((tab) => tab.key === tabId);
        this.activeId = _tabId >= 0 ? _tabId : 0;

        if (tabId === ContractTab.Contract) {
          this.loadingContract = false;
          const reload = this.router.getCurrentNavigation()?.extras?.state?.reload;

          if (reload) {
            this.contractService.loadContractDetail(this.contractsAddress);
          }
        } else {
          this.getTransaction();
        }
      } else {
        this.currentTab = ContractTab.Transactions;
        this.activeId = 0;
        this.getTransaction();
      }
    });

    this.timerGetUpTime = setInterval(() => {
      this.getTransaction(false);
    }, 30000);
  }

  changeTab(tabId): void {
    tabId = tabId || 'transactions';
    this.location.replaceState('/contracts/' + this.contractInfo.contractsAddress + '?tabId=' + tabId);
    this.currentTab = tabId;

    //check fist load tab tx of contract
    if (this.isFirstLoad && this.currentTab === ContractTab.Transactions && !this.contractTransaction['count']) {
      this.loadingContract = true;
      this.getTransaction();
      this.isFirstLoad = false;
    }
  }

  getTransaction(isInit = true): void {
    if (this.commonService.isValidContract(this.contractsAddress)) {
      const payload = {
        limit: this.limit,
        value: this.contractsAddress,
        compositeKey: 'execute._contract_address',
      };
      this.transactionService.getListTxCondition(payload).subscribe({
        next: (res) => {
          const data = res;
          if (res?.transaction?.length > 0) {
            const txsExecute = convertDataTransaction(data, this.environmentService.getDecimals());
            this.contractTransaction['data'] = txsExecute;
            this.contractTransaction['count'] = this.contractTransaction['data'].length || 0;

            if (!isInit && this.dataInstantiate?.length > 0) {
              this.contractTransaction['data'] = [...this.contractTransaction['data'], this.dataInstantiate[0]];
              this.contractTransaction['count'] = this.contractTransaction['count'] + this.dataInstantiate?.length;
            }
          } else {
            this.contractTransaction.count = 0;
          }
        },
        error: (e) => {
          if (e.name === TIMEOUT_ERROR) {
            this.errTxt = e.message;
          } else {
            this.errTxt = e.status + ' ' + e.statusText;
          }
          this.loadingContract = false;
        },
        complete: () => {
          this.loadingContract = false;
        },
      });
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
