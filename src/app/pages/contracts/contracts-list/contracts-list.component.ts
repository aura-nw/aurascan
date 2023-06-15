import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ContractRegisterType, ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { DATEFORMAT, PAGE_EVENT } from '../../../core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from '../../../core/constants/token.constant';
import { TableTemplate } from '../../../core/models/common.model';
import { ContractService } from '../../../core/services/contract.service';
import { shortenAddress } from '../../../core/utils/common/shorten';
import { Globals } from '../../../global/global';
import { TYPE_CW4973 } from 'src/app/core/constants/contract.constant';

@Component({
  selector: 'app-contracts-list',
  templateUrl: './contracts-list.component.html',
  styleUrls: ['./contracts-list.component.scss'],
})
export class ContractsListComponent implements OnInit, OnDestroy {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;
  textSearch = '';
  templates: Array<TableTemplate> = [
    { matColumnDef: 'address', headerCellDef: 'Address', isUrl: '/contracts', isShort: true },
    { matColumnDef: 'name', headerCellDef: 'Contract Name' },
    { matColumnDef: 'code_id', headerCellDef: 'Code ID' },
    { matColumnDef: 'type', headerCellDef: 'Type Contract' },
    { matColumnDef: 'compiler_version', headerCellDef: 'Version' },
    { matColumnDef: 'contract_verification', headerCellDef: 'Verified' },
    { matColumnDef: 'creator', headerCellDef: 'Creator', isUrl: '/account', isShort: true },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  pageIndex = 0;
  dataSource = new MatTableDataSource<any>();
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  filterButtons = [];
  searchSubject = new Subject();
  destroy$ = new Subject();
  contractRegisterType = ContractRegisterType;
  listContract = [];
  contractVerifyType = ContractVerifyType;

  constructor(
    public translate: TranslateService,
    public global: Globals,
    private contractService: ContractService,
    private datePipe: DatePipe,
    private layout: BreakpointObserver,
  ) {}

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.getListContract();

    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageChange.selectPage(0);
      });
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  getListContract() {
    let payload = {
      limit: 20,
      keyword: this.textSearch,
      contractType: this.filterButtons?.length ? this.filterButtons : null,
      offset: this.pageIndex * this.pageData.pageSize,
    };
    this.contractService.getListContract(payload).subscribe((res) => {
      if (res?.smart_contract?.length) {
        res?.smart_contract.forEach((item) => {
          item.verified_at = this.datePipe.transform(
            item.code?.code_id_verifications[0]?.verified_at,
            DATEFORMAT.DATETIME_UTC,
          );
          item.type = item.code.type;
          if (item.type === ContractRegisterType.CW721 && item?.name === TYPE_CW4973) {
            item.type = ContractRegisterType.CW4973;
          }
          item.compiler_version = item.code?.code_id_verifications[0]?.compiler_version;
          item.contract_verification = item.code.code_id_verifications[0]?.verification_status;
        });
        this.dataSource.data = [...res.smart_contract];
        this.pageData.length = res.smart_contract_aggregate?.aggregate?.count;
      } else {
        this.dataSource.data = [];
        this.listContract = [];
        this.pageData.length = 0;
      }
    });
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.getListContract();
  }

  shortenAddress(address: string): string {
    if (address) {
      return shortenAddress(address, 8);
    }
    return '';
  }

  resetFilterSearch() {
    this.textSearch = '';
    this.filterButtons = [];
    this.dataSource.data = [];
    this.pageData.length = 0;
    this.onKeyUp();
  }

  filterButton(val: string) {
    const i = this.filterButtons.findIndex((i) => i === val);
    switch (val) {
      case 'All':
        if (i >= 0) {
          this.filterButtons = this.filterButtons.filter((item) => item !== val);
        } else {
          this.filterButtons = [];
        }
        break;
      case ContractRegisterType.CW20:
      case ContractRegisterType.CW721:
      case ContractRegisterType.CW4973:
      case '': //Others
      default:
        if (i >= 0) {
          this.filterButtons = this.filterButtons.filter((item) => item !== val);
        } else {
          this.filterButtons.push(val);
        }
    }
    this.pageChange.selectPage(0);
  }
}
