import { Component, OnInit, ViewChild } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { TokenService } from 'src/app/core/services/token.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { TableTemplate } from '../../../../core/models/common.model';
import { Globals } from '../../../../global/global';

@Component({
  selector: 'app-token-cw721',
  templateUrl: './token-cw721.component.html',
  styleUrls: ['./token-cw721.component.scss'],
})
export class TokenCw721Component implements OnInit {
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
  isSorting = true;
  searchSubject = new Subject();
  destroy$ = new Subject<void>();
  image_s3 = this.environmentService.configValue.image_s3;
  defaultLogoToken = this.image_s3 + 'images/icons/token-logo.png';

  constructor(
    public translate: TranslateService,
    public global: Globals,
    public tokenService: TokenService,
    private environmentService: EnvironmentService,
    public commonService: CommonService,
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
    const addressNameTag = this.commonService.findNameTag(keySearch);
    if (addressNameTag?.length > 0) {
      keySearch = addressNameTag;
    }

    this.tokenService.getListCW721Token(payload, keySearch).subscribe((res) => {
      this.dataSource = new MatTableDataSource<any>(res.list_token);
      this.pageData.length = res.total_token?.aggregate?.count;
    });
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
}
