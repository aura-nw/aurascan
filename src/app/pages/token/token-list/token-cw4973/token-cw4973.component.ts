import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { TokenService } from 'src/app/core/services/token.service';
import { ResponseDto, TableTemplate } from '../../../../core/models/common.model';
import { Globals } from '../../../../global/global';

@Component({
  selector: 'app-token-cw4973',
  templateUrl: './token-cw4973.component.html',
  styleUrls: ['./token-cw4973.component.scss'],
})
export class TokenCw4973Component implements OnInit {
  textSearch = '';
  filterSearchData = [];
  dataSearch: any;
  templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'id' },
    { matColumnDef: 'token', headerCellDef: 'name' },
    { matColumnDef: 'tokenContract', headerCellDef: 'tokenContract' },
    { matColumnDef: 'attestor', headerCellDef: 'attestor' },
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
  enterSearch = '';

  image_s3 = this.environmentService.configValue.image_s3;
  defaultLogoToken = this.image_s3 + 'images/icons/token-logo.png';

  constructor(
    public translate: TranslateService,
    public global: Globals,
    private route: ActivatedRoute,
    public tokenService: TokenService,
    public soulboundService: SoulboundService,
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
    };
    this.soulboundService.getListABT(payload).subscribe((res: ResponseDto) => {
      if (res.data.length > 0) {
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

      this.soulboundService.getListABT(payload).subscribe((res: ResponseDto) => {
        if (res?.data?.length > 0) {
          this.dataSearch = res.data;
        }

        let keyWord = this.textSearch.toLowerCase();
        this.filterSearchData = this.dataSearch?.filter(
          (data) =>
            data.token_name.toLowerCase().includes(keyWord) ||
            data.contract_address.toLowerCase().includes(keyWord) ||
            data.minter_address.toLowerCase().includes(keyWord),
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
      window.location.href = `/tokens/token-abt?a=${this.textSearch}`;
    }
  }

  resetSearch() {
    if (this.enterSearch) {
      window.location.href = `/tokens/token-abt`;
    } else {
      this.textSearch = '';
      this.enterSearch = '';
    }
  }
}
