import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { CONTRACT_TABLE_TEMPLATES } from 'src/app/core/constants/contract.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { IResponsesSuccess, TableTemplate } from 'src/app/core/models/common.model';
import { IContractsResponse, ITableContract } from 'src/app/core/models/contract.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { parseLabel } from 'src/app/core/utils/common/parsing';
import { isContract } from 'src/app/core/utils/common/validation';
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

  contract$ = combineLatest([this.activeRouter.params, this.activeRouter.queryParams]).pipe(
    map((result) => ({
      params: result[0],
      queryParams: result[1],
    })),
    mergeMap(({ params, queryParams }) => {
      if (isContract(params?.addressId)) {
        this.contractInfo.contractsAddress = params?.addressId;
        let payload = {
          limit: 20,
          offset: +queryParams['offset'] || 0,
          label: parseLabel(queryParams['label'] || ''),
          contract_address: params.addressId,
        };

        this.queryParams = {
          offset: +queryParams['offset'] || 0,
          label: queryParams['label'],
        };

        return this.contractService.getTransactions(payload);
      }
      this.router.navigate(['']);
      return of(null);
    }),
    map((res: IResponsesSuccess<IContractsResponse[]>) => res && this.checkResponse(res)),
  );

  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  constructor(
    public translate: TranslateService,
    private router: Router,
    private contractService: ContractService,
    private activeRouter: ActivatedRoute,
    private layout: BreakpointObserver,
    private environmentService: EnvironmentService,
  ) {
    const valueColumn = this.templates.find((item) => item.matColumnDef === 'value');

    valueColumn &&
      ((v) => {
        v.suffix = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
      })(valueColumn);
  }

  ngOnInit(): void {}

  onChangePage(event) {
    this.router.navigate([`/contracts/transactions`, this.contractInfo.contractsAddress], {
      queryParams: {
        label: this.queryParams?.label || '',
        offset: (event?.next || 0) * 20,
      },
    });
  }

  filterTransaction(event): void {
    if (event?.key) {
      this.router.navigate([`/contracts/transactions`, this.contractInfo.contractsAddress], {
        queryParams: {
          label: event.key,
        },
      });
    } else {
      this.router.navigate([`/contracts/transactions`, this.contractInfo.contractsAddress]);
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
