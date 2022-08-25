import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PAGE_EVENT, SORT_ORDER } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TokenService } from 'src/app/core/services/token.service';
import { ResponseDto, TableTemplate } from '../../../../core/models/common.model';
import { Globals } from '../../../../global/global';

@Component({
  selector: 'app-token-cw721',
  templateUrl: './token-cw721.component.html',
  styleUrls: ['./token-cw721.component.scss'],
})
export class TokenCw721Component implements OnInit {
  textSearch = '';
  filterSearchData = [];
  dataSearch: any;
  templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'id' },
    { matColumnDef: 'token', headerCellDef: 'name' },
    { matColumnDef: 'tokenContract', headerCellDef: 'tokenContract' },
    { matColumnDef: 'transfers_24h', headerCellDef: 'transfer' },
    { matColumnDef: 'transfers_3d', headerCellDef: 'transfer3d' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  dataSourceBk: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  sortedData: any;
  sort: MatSort;
  enterSearch = '';
  typeSortBy = {
    transfers24h: 'transfers_24h',
    transfers3d: 'transfers_3d',
  };
  sortBy = this.typeSortBy.transfers24h;
  sortOrder = SORT_ORDER.DESC;
  isSorting = true;

  image_s3 = this.environmentService.configValue.image_s3;
  defaultLogoToken = this.image_s3 + 'images/icons/token-logo.png';

  constructor(
    public translate: TranslateService,
    public global: Globals,
    private route: ActivatedRoute,
    public tokenService: TokenService,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.enterSearch = params?.a || '';
      this.textSearch = this.enterSearch;
    });
    this.getTokenData();
  }

  getTokenData() {
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      keyword: this.enterSearch,
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

        this.dataSource = new MatTableDataSource<any>(res.data);
        this.dataSourceBk = this.dataSource;
        this.pageData.length = res.meta.count;
      }
    });
  }

  searchToken(): void {
    if (this.textSearch?.length > 0) {
      let payload = {
        limit: 0,
        offset: 0,
        keyword: this.textSearch,
      };

      this.tokenService.getListCW721Token(payload).subscribe((res: ResponseDto) => {
        if (res?.data?.length > 0) {
          this.dataSearch = res.data;
        }

        let keyWord = this.textSearch.toLowerCase();
        this.filterSearchData = this.dataSearch?.filter(
          (data) => data.name.toLowerCase().includes(keyWord) || data.contract_address.toLowerCase().includes(keyWord),
        );
      });
    }
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getTokenData();
  }

  setPageList(): void {
    if (this.filterSearchData?.length > 0) {
      window.location.href = `/tokens/tokens-nft?a=${this.textSearch}`;
    }
  }

  resetSearch() {
    if (this.enterSearch) {
      window.location.href = `/tokens/tokens-nft`;
    } else {
      this.textSearch = '';
      this.enterSearch = '';
    }
  }

  sortData(sort: Sort) {
    if (!this.isSorting) {
      this.dataSource.data.sort((a, b) => {
        const isAsc = sort.direction === SORT_ORDER.ASC;
        switch (sort.active) {
          case 'transfers_24h':
            this.sortBy = this.typeSortBy.transfers24h;
            this.sortOrder = sort.direction;
            this.getTokenData();
            return 0;
          case 'transfers_3d':
            this.sortBy = this.typeSortBy.transfers3d;
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
