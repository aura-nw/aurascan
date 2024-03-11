import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { PAGE_EVENT, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { EVMContractRegisterType } from 'src/app/core/constants/contract.enum';
import { TableTemplate } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
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
  EvmContractRegisterType = EVMContractRegisterType;

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
    this.getListEvmContract();

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

  getListEvmContract() {
    this.textSearch = this.textSearch?.trim();
    let payload = {
      limit: this.pageData.pageSize,
      offset: (this.pageData.pageIndex - 1) * this.pageData.pageSize,
      keyword: this.textSearch,
      // contractType: this.filterButtons?.length > 0 && this.filterButtons?.length < 4 ? this.filterButtons : null,
    };

    this.contractService.getListEvmContract(payload).subscribe({
      next: (res) => {
        if (res?.evm_smart_contract?.length) {
          res?.evm_smart_contract.forEach((item) => {});
          this.dataSource.data = res.evm_smart_contract;
          this.pageData.length = res.evm_smart_contract_aggregate?.aggregate?.count;
        } else {
          this.dataSource.data = [];
          this.listContract = [];
          this.pageData.length = 0;
        }
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.status + ' ' + e.statusText;
        }
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  pageEvent(pageIndex: number): void {
    // reset page 1 if pageIndex = 0
    if (pageIndex === 0) {
      this.pageData.pageIndex = 1;
    }
    this.getListEvmContract();
  }

  resetFilterSearch() {
    this.textSearch = '';
    this.filterButtons = [];
    this.pageEvent(0);
  }

  filterButton(val: string) {
    const i = this.filterButtons.findIndex((i) => i === val);

    switch (val) {
      case 'All':
        this.filterButtons = [];
        break;
      case EVMContractRegisterType.ERC20:
      case EVMContractRegisterType.ERC721:
      case EVMContractRegisterType.ERC1155:
      case '': //Others
      default:
        if (i >= 0) {
          this.filterButtons = this.filterButtons.filter((item) => item !== val);
        } else {
          this.filterButtons.push(val);
        }
    }
    this.pageEvent(0);
  }
}
