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
import { convertDataTransaction } from 'src/app/global/global';
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
    this.getData();
    this.timerGetUpTime = setInterval(() => {
      // reload when page = 0
      if (this.currentPage === 0) {
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
        this.label = params['label'] || 0;
      }
      switch (+this.label) {
        case 1:
          this.getDataTable(null, isReload);
          break;
        case 2:
          this.getDataInstantiate();
          break;
        default:
          this.getDataTable(null, isReload);
      }
    });
  }

  getDataTable(nextKey = null, isReload = false) {
    if (!this.label || +this.label == 1) {
      this.contractService.getTransactionsIndexer(100, this.contractAddress, 'execute', nextKey).subscribe(
        (dataExecute) => {
          const { code, data } = dataExecute;
          if (code === 200) {
            const txsExecute = convertDataTransaction(data, this.coinInfo);
            this.lengthTxsExecute = txsExecute.length;
            if (dataExecute.data.count > 0) {
              this.nextKey = dataExecute.data.nextKey;

              if (this.contractTransaction['data']?.length > 0 && !isReload) {
                this.contractTransaction['data'] = [...this.contractTransaction['data'], ...txsExecute];
              } else {
                this.contractTransaction['data'] = txsExecute;
              }

              if (this.nextKey === null) {
                this.getDataInstantiate();
              } else {
                this.contractTransaction['count'] = this.contractTransaction['data']?.length;
              }
            } else {
              this.getDataInstantiate();
            }
          }
        },
        () => {},
        () => {
          this.isLoadingTX = false;
        },
      );
    }
  }

  getDataInstantiate(): void {
    this.contractService.getTransactionsIndexer(1, this.contractAddress, 'instantiate').subscribe(
      (dataInstantiate) => {
        if (dataInstantiate.data.count > 0) {
          this.txsInstantiate = convertDataTransaction(dataInstantiate.data, this.coinInfo);
          if (this.txsInstantiate.length > 0) {
            this.txsInstantiate[0]['type'] =
              dataInstantiate.data?.transactions[0]?.tx_response?.tx?.body.messages[0]['@type'];
            this.txsInstantiate[0]['contract_address'] = this.contractAddress;
            if (+this.label == 2) {
              this.contractTransaction['data'] = this.txsInstantiate;
              this.contractTransaction['count'] = this.txsInstantiate.length || 0;
              return;
            }
            if (!this.label) {
              if (this.contractTransaction['data']?.length > 1) {
                this.contractTransaction['data'].push(this.txsInstantiate[0]);
              } else {
                this.contractTransaction['data'] = this.txsInstantiate;
              }
              this.contractTransaction['count'] = this.contractTransaction['data']?.length || 0;
              return;
            }
          }
        }
      },
      () => {},
      () => {
        this.isLoadingTX = false;
      },
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
