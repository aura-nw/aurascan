import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
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
    { matColumnDef: 'transfer', headerCellDef: 'transfer' },
    { matColumnDef: 'transfer3d', headerCellDef: 'transfer3d' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  sortedData: any;
  sort: MatSort;

  constructor(
    public translate: TranslateService,
    public global: Globals,
    private router: Router,
    public tokenService: TokenService,
  ) {}

  ngOnInit(): void {
    this.getTokenData();
  }

  getTokenData() {
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      keyword: '',
    };
    this.tokenService.getListCW721Token(payload).subscribe((res: ResponseDto) => {
      if (res.data.length > 0) {
        res.data.forEach((data) => {
          data['isValueUp'] = true;
          if (data.change < 0) {
            data['isValueUp'] = false;
            data.change = Number(data.change.toString().substring(1));
          }
        });

        this.dataSource = new MatTableDataSource<any>(res.data);
        this.pageData.length = res.meta.count;
      }
    });
  }

  searchToken(): void {
    if (this.textSearch.length > 0) {
      let payload = {
        limit: this.pageData.pageSize,
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

  handleLink(): void {
    if (this.filterSearchData?.length > 0) {
      this.router.navigate(['/tokens/token/', this.filterSearchData[0]?.contract_address]);
    }
  }

  sortData(sort: Sort) {
    // let data = this.mockData.slice();
    // if (!sort.active || sort.direction === '') {
    //   this.sortedData = data;
    //   return;
    // }
    // this.sortedData = data.sort((a, b) => {
    //   const isAsc = sort.direction === 'asc';
    //   switch (sort.active) {
    //     case 'transfer':
    //       return this.compare(a.transfer, b.transfer, isAsc);
    //     case 'transfer3d':
    //       return this.compare(a.transfer3d, b.transfer3d, isAsc);
    //     default:
    //       return 0;
    //   }
    // });
    // let dataFilter = this.sortedData;
    // this.pageData = {
    //   length: dataFilter.length,
    //   pageSize: this.pageSize,
    //   pageIndex: PAGE_EVENT.PAGE_INDEX,
    // };
    // this.dataSource = new MatTableDataSource<any>(dataFilter);
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
