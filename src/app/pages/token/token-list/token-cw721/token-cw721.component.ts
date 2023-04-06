import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TokenService } from 'src/app/core/services/token.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { ResponseDto, TableTemplate } from '../../../../core/models/common.model';
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
    { matColumnDef: 'total_tx', headerCellDef: 'totalTx' },
    { matColumnDef: 'transfers_24h', headerCellDef: 'transfer' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  sort: MatSort;
  typeSortBy = {
    transfers24h: 'transfers_24h',
    totalTx: 'total_tx',
  };
  sortBy = this.typeSortBy.transfers24h;
  sortOrder = 'desc';
  isSorting = true;
  searchSubject = new Subject();
  destroy$ = new Subject();
  image_s3 = this.environmentService.configValue.image_s3;
  defaultLogoToken = this.image_s3 + 'images/icons/token-logo.png';

  constructor(
    public translate: TranslateService,
    public global: Globals,
    public tokenService: TokenService,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.getTokenData();

    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.pageData.pageIndex === PAGE_EVENT.PAGE_INDEX) {
          this.getTokenData();
        } else {
          this.pageChange.selectPage(0);
        }
      });
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
    this.destroy$.next();
    this.destroy$.complete();
  }

  getTokenData() {
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      keyword: this.textSearch,
      sort_column: this.sortBy,
      sort_order: this.sortOrder,
    };
    this.tokenService.getListCW721Token(payload).subscribe((res: ResponseDto) => {
      this.isSorting = false;
      if (res.data.length > 0) {
        res.data.forEach((data) => {
          data['isValueUp'] = true;
          if (data.change < 0) {
            data['isValueUp'] = false;
            data.change = Number(data.change.toString().substring(1));
          }
        });
      }
      this.dataSource = new MatTableDataSource<any>(res.data);
      this.pageData.length = res.meta.count;
    });
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getTokenData();
  }

  resetSearch() {
    this.textSearch = '';
    this.onKeyUp();
  }

  sortData(sort: Sort) {
    if (!this.isSorting) {
      this.dataSource.data.sort((a, b) => {
        switch (sort.active) {
          case 'transfers_24h':
            this.sortBy = this.typeSortBy.transfers24h;
            this.sortOrder = sort.direction;
            this.getTokenData();
            return 0;
          case 'total_tx':
            this.sortBy = this.typeSortBy.totalTx;
            this.sortOrder = sort.direction;
            this.getTokenData();
            return 0;
          default:
            return 0;
        }
      });
    }
  }
}
