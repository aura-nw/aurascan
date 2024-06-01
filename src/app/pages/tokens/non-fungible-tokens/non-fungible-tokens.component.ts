import { Component, OnInit, ViewChild } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatSort, Sort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { PAGE_EVENT, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { TokenService } from 'src/app/core/services/token.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { TableTemplate } from '../../../core/models/common.model';

@Component({
  selector: 'app-non-fungible-tokens',
  templateUrl: './non-fungible-tokens.component.html',
  styleUrls: ['./non-fungible-tokens.component.scss'],
})
export class NonFungibleTokensComponent implements OnInit {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;
  textSearch = '';
  templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'id' },
    { matColumnDef: 'token', headerCellDef: 'name' },
    { matColumnDef: 'tokenContract', headerCellDef: 'tokenContract' },
    { matColumnDef: 'total_activity', headerCellDef: 'total_activity' },
    { matColumnDef: 'transfer_24h', headerCellDef: 'transfer' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: 1,
  };
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  sort: MatSort;
  sortBy = 'transfer_24h';
  sortOrder = 'desc';
  searchSubject = new Subject();
  destroy$ = new Subject<void>();
  isLoading = true;
  errTxt: string;
  filterBy = 'ERC721';

  constructor(
    public translate: TranslateService,
    private tokenService: TokenService,
    private nameTagService: NameTagService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.getTokenData();

    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageEvent(0);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getTokenData() {
    this.textSearch = this.textSearch?.trim();
    const payload = {
      limit: this.pageData.pageSize,
      offset: (this.pageData.pageIndex - 1) * this.pageData.pageSize,
      sort_column: this.sortBy,
      sort_order: this.sortOrder,
    };

    let keySearch = this.textSearch;

    if (this.filterBy === 'ERC721') {
      const listAddress = this.nameTagService.findAddressListByNameTag(keySearch, this.filterBy === 'ERC721');
      let tagAddress = `["${keySearch}"]`;
      if (listAddress?.length > 0) {
        tagAddress = '';
        listAddress.forEach((addr) => {
          tagAddress += `"${addr}",`;
        });
        tagAddress = `[${tagAddress}"${keySearch}"]`;
      }
      this.tokenService.getListErc721Token(payload, keySearch, tagAddress).subscribe({
        next: (res) => {
          this.dataSource = new MatTableDataSource<any>(res.list_token);
          this.pageData.length = res.total_token?.aggregate?.count;
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
    } else if (this.filterBy === 'CW721') {
      const addressNameTag = this.nameTagService.findAddressByNameTag(keySearch);

      if (addressNameTag?.length > 0) {
        keySearch = addressNameTag;
      }
      this.tokenService.getListCW721Token(payload, keySearch).subscribe({
        next: (res) => {
          this.dataSource = new MatTableDataSource<any>(res.list_token);
          this.pageData.length = res.total_token?.aggregate?.count;
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
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  pageEvent(pageIndex: number): void {
    // reset page 1 if pageIndex = 0
    if (pageIndex === 0) {
      this.pageData.pageIndex = 1;
    }
    this.getTokenData();
  }

  resetSearch() {
    this.textSearch = '';
    this.pageEvent(0);
  }

  sortData(sort: Sort) {
    this.sortBy = sort.active;
    this.sortOrder = sort.direction;
    this.getTokenData();
  }

  resetFilterSearch() {
    this.textSearch = '';
    this.pageEvent(0);
  }

  filterButton(val: string) {
    this.filterBy = val;
    this.pageEvent(0);
  }
}
