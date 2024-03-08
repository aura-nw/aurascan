import { Component, OnDestroy, OnInit } from '@angular/core';
import { TableTemplate } from 'src/app/core/models/common.model';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ContractService } from 'src/app/core/services/contract.service';
import { DatePipe } from '@angular/common';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { MAX_LENGTH_SEARCH_TOKEN } from '../../../core/constants/token.constant';

@Component({
  selector: 'app-evm-contracts-list',
  templateUrl: './evm-contracts-list.component.html',
  styleUrls: ['./evm-contracts-list.component.scss'],
})
export class EvmContractsListComponent implements OnInit, OnDestroy {
  templates: Array<TableTemplate> = [
    { matColumnDef: 'address', headerCellDef: 'Address', isUrl: '/evm-contracts', headerWidth: 250 },
    { matColumnDef: 'name', headerCellDef: 'Contract Name', headerWidth: 210 },
    { matColumnDef: 'label', headerCellDef: 'Label', headerWidth: 190 },
    { matColumnDef: 'version', headerCellDef: 'Contract Ver', headerWidth: 100 },
    { matColumnDef: 'type', headerCellDef: 'Type Contract', headerWidth: 150 },
    { matColumnDef: 'token_tracker', headerCellDef: 'Token Tracker', headerWidth: 100 },
    { matColumnDef: 'creator', headerCellDef: 'Creator', isUrl: '/account', headerWidth: 250 },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: 1,
  };
  filterButtons = [];
  listContract = [];
  textSearch = '';
  isLoading = true;
  errTxt: string;

  dataSource = new MatTableDataSource<any>();
  searchSubject = new Subject();
  destroy$ = new Subject<void>();

  MAX_LENGTH_SEARCH_TOKEN = MAX_LENGTH_SEARCH_TOKEN;

  constructor(
    public translate: TranslateService,
    private contractService: ContractService,
    private datePipe: DatePipe,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.getListContract();

    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageEvent(0);
      });
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  getListContract() {
    this.listContract = [
      {
        address: 'aura1w2hv4gw84mcu9qlp9qvg93cydvuxj548r9qjhyqlg82gasm5q9pq5u90t5',
        contract_verification: true,
        name: 'Aura (AURA)',
        label: 'aura-usdc pool',
        version: '0.15.0',
        type: 'ERC20',
        token_tracker: 'namthange',
        creator: 'aura13t8ej6yvje8n9zl7hcvj8ks24tp5qvdsgfhnjx',
      },
      {
        address: 'aura1w2hv4gw84mcu9qlp9qvg93cydvuxj548r9qjhyqlg82gasm5q9pq5u90t5',
        contract_verification: false,
        name: 'Aura (AURA)',
        label: 'aura-usdc pool',
        version: '0.15.0',
        type: 'ERC20',
        token_tracker: 'namthange',
        creator: 'aura13t8ej6yvje8n9zl7hcvj8ks24tp5qvdsgfhnjx',
      },
      {
        address: 'aura1w2hv4gw84mcu9qlp9qvg93cydvuxj548r9qjhyqlg82gasm5q9pq5u90t5',
        contract_verification: true,
        name: 'Aura (AURA)',
        label: 'aura-usdc pool',
        version: '0.15.0',
        type: 'ERC20',
        token_tracker: 'namthange',
        creator: 'aura13t8ej6yvje8n9zl7hcvj8ks24tp5qvdsgfhnjx',
      },
      {
        address: 'aura1w2hv4gw84mcu9qlp9qvg93cydvuxj548r9qjhyqlg82gasm5q9pq5u90t5',
        contract_verification: true,
        name: 'Aura (AURA)',
        label: 'aura-usdc pool',
        version: '0.15.0',
        type: 'ERC20',
        token_tracker: 'namthange',
        creator: 'aura13t8ej6yvje8n9zl7hcvj8ks24tp5qvdsgfhnjx',
      },
      {
        address: 'aura1w2hv4gw84mcu9qlp9qvg93cydvuxj548r9qjhyqlg82gasm5q9pq5u90t5',
        contract_verification: false,
        name: 'Aura (AURA)',
        label: 'aura-usdc pool',
        version: '0.15.0',
        type: 'ERC20',
        token_tracker: 'namthange',
        creator: 'aura13t8ej6yvje8n9zl7hcvj8ks24tp5qvdsgfhnjx',
      },
      {
        address: 'aura1w2hv4gw84mcu9qlp9qvg93cydvuxj548r9qjhyqlg82gasm5q9pq5u90t5',
        contract_verification: false,
        name: 'Aura (AURA)',
        label: 'aura-usdc pool',
        version: '0.15.0',
        type: 'ERC20',
        token_tracker: 'namthange',
        creator: 'aura13t8ej6yvje8n9zl7hcvj8ks24tp5qvdsgfhnjx',
      },
      {
        address: 'aura1w2hv4gw84mcu9qlp9qvg93cydvuxj548r9qjhyqlg82gasm5q9pq5u90t5',
        contract_verification: false,
        name: 'Aura (AURA)',
        label: 'aura-usdc pool',
        version: '0.15.0',
        type: 'ERC20',
        token_tracker: 'namthange',
        creator: 'aura13t8ej6yvje8n9zl7hcvj8ks24tp5qvdsgfhnjx',
      },
    ];
    this.dataSource.data = this.listContract;
    this.pageData.length = this.listContract.length;
    this.isLoading = false;
  }

  pageEvent(pageIndex: number): void {
    // reset page 1 if pageIndex = 0
    if (pageIndex === 0) {
      this.pageData.pageIndex = 1;
    }
    this.getListContract();
  }

  resetFilterSearch() {
    this.textSearch = '';
    this.filterButtons = [];
    this.pageEvent(0);
  }

  filterButton(val: string) {}
}
