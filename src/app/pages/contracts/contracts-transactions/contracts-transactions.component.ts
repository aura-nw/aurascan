import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { CONTRACT_TABLE_TEMPLATES } from 'src/app/core/constants/contract.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { ITableContract } from 'src/app/core/models/contract.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { convertDataTransaction, convertDataTransactionV2 } from 'src/app/global/global';
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

  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  coinInfo = this.environmentService.configValue.chain_info.currencies[0];

  constructor(
    public translate: TranslateService,
    private router: Router,
    private contractService: ContractService,
    private layout: BreakpointObserver,
    private environmentService: EnvironmentService,
    private route: ActivatedRoute,
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
      this.getDataTable(null, isReload);
      // switch (+this.label) {
      //   case 1:
      //     this.getDataTable(null, isReload);
      //     break;
      //   default:
      //     this.getDataTable(null, isReload);
      // }
    });
  }

  getDataTable(nextKey = null, isReload = false) {
    if (+this.label == this.modeTxType.In && !this.hasLoadIns) {
      return;
    }
    if (!this.label || +this.label == this.modeTxType.In) {
      const type = +this.label == this.modeTxType.In ? 'execute' : '';
      this.contractService.getTransactionsIndexerV2(100, this.contractAddress, type, this.hashIns, nextKey).subscribe(
        (dataExecute) => {
          if (dataExecute) {
            const txsExecute = convertDataTransactionV2(dataExecute, this.coinInfo);
            this.lengthTxsExecute = txsExecute.length;
            if (dataExecute.transaction?.length > 0) {
              if (txsExecute.length >= 100) {
                this.nextKey = dataExecute?.transaction[txsExecute.length - 1].id;
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
    this.contractService.getTransactionsIndexerV2(1, this.contractAddress, 'instantiate').subscribe(
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
