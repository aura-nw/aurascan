import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
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

  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  coinDecimals = this.environmentService.configValue.chain_info.currencies[0].coinDecimals;
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;

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
        v.suffix = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
      })(valueColumn);
  }

  ngOnInit(): void {
    this.contractAddress = this.route.snapshot.paramMap.get('addressId');
    if (this.route.snapshot.queryParams['label']) {
      this.label = this.route.snapshot.queryParams['label'] || 0;
    }
    this.getDataTable();
    this.router.events.subscribe((val) => this.getDataTable());
  }

  getDataTable() {
    forkJoin({
      dataExecute: this.contractService.getTransactionsIndexer(100, this.contractAddress, 'execute'),
      dataInstantiate: this.contractService.getTransactionsIndexer(1, this.contractAddress, 'instantiate'),
    }).subscribe(({ dataExecute, dataInstantiate }) => {
      const { code, data } = dataExecute;
      if (code === 200) {
        const txsExecute = convertDataTransaction(data, this.coinDecimals, this.coinMinimalDenom);

        if (dataExecute.data.count > 0 || dataInstantiate?.data.count > 0) {
          const { code, data } = dataInstantiate;
          const txsInstantiate = convertDataTransaction(data, this.coinDecimals, this.coinMinimalDenom);
          if (txsInstantiate.length > 0) {
            txsInstantiate[0]['type'] = dataInstantiate.data?.transactions[0]?.tx?.body.messages[0]['@type'];
            txsInstantiate[0]['contract_address'] = this.contractAddress;
          }

          this.contractTransaction['data'] = txsExecute;
          this.contractTransaction['count'] = dataExecute.data.count;

          if (+this.label == 2) {
            this.contractTransaction['data'] = txsInstantiate;
            this.contractTransaction['count'] = txsInstantiate.length || 0;
            return;
          }

          if (this.label == 0) {
            this.contractTransaction['count'] = 0;
            return;
          }

          if (txsInstantiate?.length > 0 && !this.label) {
            this.contractTransaction['data'] = [...this.contractTransaction['data'], ...txsInstantiate];
            this.contractTransaction['count'] = dataExecute.data.count + txsInstantiate?.length || 0;
          }
        }
      }
    });
  }

  onChangePage(event) {
    this.router.navigate([`/contracts/transactions`, this.contractAddress], {
      queryParams: {
        label: this.queryParams?.label || '',
        offset: (event?.next || 0) * this.pageSize,
      },
    });
  }

  filterTransaction(event): void {
    if (event?.key) {
      window.location.href = `/contracts/transactions/${this.contractAddress}?label=${event.key}`;
    } else {
      window.location.href = `/contracts/transactions/${this.contractAddress}`;
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
