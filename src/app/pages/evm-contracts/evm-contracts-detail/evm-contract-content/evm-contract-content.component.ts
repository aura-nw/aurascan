import { Location } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { LENGTH_CHARACTER, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { CONTRACT_TAB, EVM_CONTRACT_TABLE_TEMPLATES } from 'src/app/core/constants/contract.constant';
import { ContractTab, ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { EWalletType } from 'src/app/core/constants/wallet.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { mappingMethodName } from 'src/app/global/global';

@Component({
  selector: 'app-evm-contract-content',
  templateUrl: './evm-contract-content.component.html',
  styleUrls: ['./evm-contract-content.component.scss'],
})
export class EvmContractContentComponent implements OnInit, OnDestroy {
  @Input() contractsAddress = '';
  @Input() contractTypeData: ContractVerifyType = ContractVerifyType.Unverified;

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
  templates: Array<TableTemplate> = EVM_CONTRACT_TABLE_TEMPLATES;
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
      this.getTransaction();
    }, 30000);
  }

  changeTab(tabId: string): void {
    this.currentTab = tabId || 'transactions';

    this.location.replaceState('/evm-contracts/' + this.contractInfo.contractsAddress + '?tabId=' + this.currentTab);

    //check fist load tab tx of contract
    if (this.isFirstLoad && this.currentTab === ContractTab.Transactions && !this.contractTransaction['count']) {
      this.loadingContract = true;
      this.getTransaction();
      this.isFirstLoad = false;
    }
  }

  getTransaction(): void {
    if (
      this.contractsAddress.startsWith(EWalletType.EVM) &&
      this.contractsAddress.length >= LENGTH_CHARACTER.EVM_ADDRESS
    ) {
      const payload = {
        limit: this.limit,
        address: this.contractsAddress.toLowerCase(),
      };

      this.transactionService
        .getListEvmContractTxByAddress(payload)
        .pipe(
          switchMap((txsRes) => {
            const listTemp = txsRes.evm_transaction
              ?.filter((j) => j.data?.length > 0)
              ?.map((k) => k.data?.substring(0, 8));
            const listMethodId = _.uniq(listTemp);
            return this.transactionService.getListMappingName(listMethodId).pipe(
              map((res) => {
                if (txsRes?.evm_transaction?.length > 0) {
                  return txsRes.evm_transaction.map((tx) => {
                    const methodId = _.get(tx, 'data')?.substring(0, 8);
                    return {
                      ...tx,
                      tx_hash: _.get(tx, 'hash'),
                      hash: _.get(tx, 'transaction.hash'),
                      method:  mappingMethodName(res, methodId),
                      from: _.get(tx, 'from'),
                      to: _.get(tx, 'to'),
                      timestamp: _.get(tx, 'transaction.timestamp'),
                      evmAmount: _.get(tx, 'value'),
                    };
                  });
                }

                return [];
              }),
            );
          }),
        )
        .subscribe({
          next: (res) => {
            this.contractTransaction['data'] = res;
            this.contractTransaction['count'] = this.contractTransaction['data'].length || 0;
            this.contractTransaction = {...this.contractTransaction};
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
