import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { CONTRACT_RESULT } from 'src/app/core/constants/contract.constant';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { DATEFORMAT, PAGE_EVENT } from '../../../core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from '../../../core/constants/token.constant';
import { TableTemplate } from '../../../core/models/common.model';
import { ContractService } from '../../../core/services/contract.service';
import { shortenAddress } from '../../../core/utils/common/shorten';
import { Globals } from '../../../global/global';

@Component({
  selector: 'app-contracts-list',
  templateUrl: './contracts-list.component.html',
  styleUrls: ['./contracts-list.component.scss'],
})
export class ContractsListComponent implements OnInit, OnDestroy {
  textSearch = '';
  searchMobVisible = false;
  templates: Array<TableTemplate> = [
    { matColumnDef: 'contract_address', headerCellDef: 'Address', isUrl: '/contracts', isShort: true },
    { matColumnDef: 'contract_name', headerCellDef: 'Contract Name' },
    { matColumnDef: 'code_id', headerCellDef: 'Code ID' },
    { matColumnDef: 'project_name', headerCellDef: 'Project' },
    { matColumnDef: 'type', headerCellDef: 'Type Contract' },
    { matColumnDef: 'compiler_version', headerCellDef: 'Version' },
    { matColumnDef: 'contract_verification', headerCellDef: 'Verified' },
    { matColumnDef: 'creator_address', headerCellDef: 'Creator', isUrl: '/account', isShort: true },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent;
  pageSize = 20;
  pageIndex = 0;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  dataSearch: any;
  filterSearchData = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  contractVerifyType = ContractVerifyType;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  urlParam = '';
  showBoxSearch = false;

  searchSubject = new Subject<string>();
  searchSubscription: Subscription;

  constructor(
    public translate: TranslateService,
    public global: Globals,
    private router: Router,
    private contractService: ContractService,
    private datePipe: DatePipe,
    private layout: BreakpointObserver,
    private route: ActivatedRoute,
  ) {}

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.urlParam = params.param;
    });
    this.textSearch = this.urlParam ? this.urlParam : '';
    this.getListContract();

    this.searchSubscription = this.searchSubject
      .asObservable()
      .pipe(
        tap(console.log),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((text) => {
          this.showBoxSearch = true;

          this.textSearch = text;
          let payload = {
            limit: 0,
            offset: 0,
            keyword: this.textSearch,
          };

          this.filterSearchData = [];

          return this.contractService.getListContract(payload);
        }),
      )
      .subscribe((res) => {
        if (res?.data?.length > 0) {
          res.data.forEach((item) => {
            item.updated_at = this.datePipe.transform(item.updated_at, DATEFORMAT.DATETIME_UTC);
          });
          this.filterSearchData = res.data;
        }
      });
  }

  getListContract() {
    let payload = {
      limit: this.pageSize,
      offset: this.pageIndex * this.pageSize,
      keyword: this.textSearch,
    };

    this.contractService.getListContract(payload).subscribe((res) => {
      this.pageData = {
        length: res?.meta?.count,
        pageSize: 20,
        pageIndex: PAGE_EVENT.PAGE_INDEX,
      };
      if (res?.data?.length > 0) {
        res.data.forEach((item) => {
          item.updated_at = this.datePipe.transform(item.updated_at, DATEFORMAT.DATETIME_UTC);
          if (item.result === CONTRACT_RESULT.INCORRECT || !item.type) {
            item.type = '-';
          } else if (item.result === CONTRACT_RESULT.TBD) {
            item.type = CONTRACT_RESULT.TBD;
          }
        });
        if (this.textSearch) {
          this.filterSearchData = res.data;
        }
        this.dataSource = res.data;
        this.dataSearch = res.data;
      }
    });
  }

  searchToken(): void {
    this.filterSearchData = [];

    if (this.textSearch && this.textSearch.length > 0) {
      this.showBoxSearch = true;
      let payload = {
        limit: 0,
        offset: 0,
        keyword: this.textSearch,
      };

      this.contractService.getListContract(payload).subscribe((res) => {
        if (res?.data?.length > 0) {
          res.data.forEach((item) => {
            item.updated_at = this.datePipe.transform(item.updated_at, DATEFORMAT.DATETIME_UTC);
          });
          this.filterSearchData = res.data;
        }
      });
    }
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    if (!this.urlParam) {
      this.textSearch = '';
      this.showBoxSearch = false;
    }
    this.getListContract();
  }

  handleLink(): void {
    if (this.filterSearchData[0]?.contract_address) {
      this.router.navigate(['/contracts/', this.filterSearchData[0]?.contract_address]);
    }
  }

  shortenAddress(address: string): string {
    if (address) {
      return shortenAddress(address, 8);
    }
    return '';
  }

  resetFilterSearch() {
    this.textSearch = '';
    this.showBoxSearch = false;
    this.filterSearchData = [];
    if (this.urlParam) {
      this.router.navigate(['/contracts']);
      this.getListContract();
    } else {
      this.searchToken();
    }
  }
}
