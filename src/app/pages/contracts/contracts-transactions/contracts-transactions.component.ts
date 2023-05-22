import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { CONTRACT_TABLE_TEMPLATES } from 'src/app/core/constants/contract.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { ITableContract } from 'src/app/core/models/contract.model';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { convertDataTransactionV2 } from 'src/app/global/global';
import { TableData } from 'src/app/shared/components/contract-table/contract-table.component';

@Component({
  selector: 'app-contracts-transactions',
  templateUrl: './contracts-transactions.component.html',
  styleUrls: ['./contracts-transactions.component.scss'],
})
export class ContractsTransactionsComponent implements OnInit {
  templates: Array<TableTemplate> = CONTRACT_TABLE_TEMPLATES;
  contractInfo: ITableContract = {
    contractsAddress: '',
    count: 0,
    popover: true,
  };

  queryParams: {
    offset: number;
    label: number | string;
  } = {
    offset: 0,
    label: '',
  };

  pageSize = 20;
  contractTransaction = {};
  contractAddress = '';
  label = null;
  nextKey = null;
  currentKey = null;
  timerGetUpTime: any;
  isLoadingTX = true;
  lengthTxsExecute = 0;
  isLoadInstantiate = false;
  txsInstantiate = [];
  currentPage = 0;
  destroyed$ = new Subject();
  modeTxType = { Out: 0, In: 1, Instantiate: 2 };
  hashIns = '';
  hasLoadIns = false;
  payload = {
    limit: 100,
  };

  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  coinInfo = this.environmentService.configValue.chain_info.currencies[0];

  constructor(
    public translate: TranslateService,
    private router: Router,
    private layout: BreakpointObserver,
    private environmentService: EnvironmentService,
    private route: ActivatedRoute,
    private transactionService: TransactionService,
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

  ngOnInit(): void {
    this.contractAddress = this.route.snapshot.paramMap.get('addressId');
    this.contractInfo.contractsAddress = this.contractAddress;
    this.payload['value'] = this.contractAddress;
    this.getData();
    this.getDataInstantiate();
    this.timerGetUpTime = setInterval(() => {
      // reload when page = 0
      if (this.currentPage === 0) {
        this.currentKey = null;
        this.getData(true);
      }
    }, 5000);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();

    if (this.timerGetUpTime) {
      clearInterval(this.timerGetUpTime);
    }
  }

  getData(isReload = false) {
    this.route.queryParams.subscribe((params) => {
      if (params['label']) {
        this.label = params['label'] || this.modeTxType.Out;
      }
      this.payload['key'] = null;
      this.payload['compositeKey'] = null;
      switch (+this.label) {
        case 1:
          this.payload['compositeKey'] = 'execute._contract_address';
          break;
        case 2:
          this.payload['compositeKey'] = 'instantiate._contract_address';
          break;
        default:
          this.payload['key'] = '_contract_address';
          break;
      }
      this.getDataTable(null, isReload);
    });
  }

  getDataTable(nextKey = null, isReload = false) {
    if (+this.label == this.modeTxType.In && !this.hasLoadIns) {
      return;
    }
    if (!this.label || +this.label == this.modeTxType.In) {
      this.payload['heightLT'] = nextKey;
      this.transactionService.getListTx(this.payload).subscribe(
        (dataExecute) => {
          if (dataExecute) {
            const txsExecute = convertDataTransactionV2(dataExecute, this.coinInfo);
            this.lengthTxsExecute = txsExecute.length;
            if (dataExecute.transaction?.length > 0) {
              this.nextKey = null;
              if (txsExecute.length >= 100) {
                this.nextKey = dataExecute?.transaction[txsExecute.length - 1].height;
              }
              if (this.contractTransaction['data']?.length > 0 && !isReload) {
                this.contractTransaction['data'] = [...this.contractTransaction['data'], ...txsExecute];
              } else if (txsExecute.length > 0) {
                this.contractTransaction['data'] = txsExecute;
              }
            }

            this.contractTransaction['count'] = this.contractTransaction['data']?.length;

            if (!isReload) {
              if (this.nextKey === null && +this.label == this.modeTxType.Instantiate) {
                this.getDataInstantiate();
              }
            }
          }
        },
        () => {},
        () => {
          this.isLoadingTX = false;
        },
      );
    } else {
      this.isLoadingTX = false;
    }
  }

  getDataInstantiate(): void {
    this.transactionService.getListTx(this.payload).subscribe(
      (dataInstantiate) => {
        this.hasLoadIns = true;
        if (dataInstantiate.transaction?.length > 0) {
          this.hashIns = dataInstantiate.transaction[0]?.hash;
          if (+this.label == this.modeTxType.Instantiate) {
            this.txsInstantiate = convertDataTransactionV2(dataInstantiate, this.coinInfo);
            this.contractTransaction['data'] = this.txsInstantiate;
            this.contractTransaction['count'] = this.txsInstantiate.length || 0;
          }
          if (+this.label == this.modeTxType.In) {
            this.getDataTable();
          } else {
            this.isLoadingTX = false;
          }
        }
      },
      () => {},
      () => {},
    );
  }

  onChangePage(event) {
    const { pageIndex, pageSize } = event;
    this.currentPage = pageIndex;
    const next = event.length <= (pageIndex + 2) * pageSize;
    if (next && this.nextKey && this.currentKey !== this.nextKey) {
      this.getDataTable(this.nextKey);
      this.currentKey = this.nextKey;
    }
  }

  filterTransaction(event): void {
    if (event?.key) {
      this.router.navigate([`/contracts/transactions/${this.contractAddress}`], {
        queryParams: {
          label: event.key,
        },
      });
    } else {
      this.router.navigate([`/contracts/transactions/${this.contractAddress}`]);
    }
  }

  checkResponse(response): TableData[] {
    if (response.data && Array.isArray(response.data)) {
      this.contractInfo.count = response.meta.count || 0;
      return response;
    }
    return [];
  }
}
