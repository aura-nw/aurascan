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
  // data table
  mockData = [
    {
      id: 1,
      name: 'Tether USD (USDT)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 12379005541,
      transfer3d: 34276784332,
    },
    {
      id: 2,
      name: 'BNB (BNB)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 22379005541,
      transfer3d: 54276784332,
    },
    {
      id: 3,
      name: 'USD Coin (USDC)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 32379005541,
      transfer3d: 54276784332,
    },
    {
      id: 4,
      name: 'HEX (HEX)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 7379005541,
      transfer3d: 44276784332,
    },
    {
      id: 5,
      name: 'Binance USD (BUSD)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 1379005541,
      transfer3d: 2276784332,
    },
    {
      id: 6,
      name: 'stETH (stETH)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 879005541,
      transfer3d: 422276784332,
    },
    {
      id: 7,
      name: 'Wrapped liquid staked Ether 2.0 (wstETH)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 2379005541,
      transfer3d: 4276784332,
    },
    {
      id: 8,
      name: 'FTX Token (FTT)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 1179005541,
      transfer3d: 4276784332,
    },
    {
      id: 9,
      name: 'SHIBA INU (SHIB)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 2279005541,
      transfer3d: 4276784332,
    },
    {
      id: 10,
      name: 'Dai Stablecoin (DAI)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 1779005541,
      transfer3d: 2276784332,
    },
    {
      id: 11,
      name: 'Matic Token (MATIC)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 179005541,
      transfer3d: 5276784332,
    },
    {
      id: 12,
      name: 'Theta Token (THETA)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 679005541,
      transfer3d: 2276784332,
    },
    {
      id: 13,
      name: 'Cronos Coin (CRO)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 879005541,
      transfer3d: 3276784332,
    },
    {
      id: 14,
      name: 'Bitfinex LEO Token (LEO)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 2879005541,
      transfer3d: 3276784332,
    },
    {
      id: 15,
      name: 'XRP (XPR)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 2579005541,
      transfer3d: 2176784332,
    },
    {
      id: 16,
      name: 'Cardano (ADA)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 3479005541,
      transfer3d: 7876784332,
    },
    {
      id: 17,
      name: 'Solana (SOL)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 2379005541,
      transfer3d: 4276784332,
    },
    {
      id: 18,
      name: 'Dogecoin (DOGE)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 1379005541,
      transfer3d: 8276784332,
    },
    {
      id: 19,
      name: 'TRON (TRX)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 3379005541,
      transfer3d: 9276784332,
    },
    {
      id: 20,
      name: 'Polkadot (DOT)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 3379005541,
      transfer3d: 7276784332,
    },
    {
      id: 21,
      name: 'Litecoin (LTC)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 3379005541,
      transfer3d: 9276784332,
    },
    {
      id: 22,
      name: 'Chainlink (LINK)',
      tokenContract: 'aura1s6rnsf93ka5g3swv858svh45da54sw7fc3nz682wm0plpl8llnksr4lqg3',
      transfer: 3379005541,
      transfer3d: 7276784332,
    },
  ];
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
  pageSize = 20;
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

  filterData(keyWord: string) {
    keyWord = keyWord.toLowerCase();
    this.filterSearchData = this.mockData.filter(
      (data) => data.name.toLowerCase().includes(keyWord) || data.tokenContract.toLowerCase().includes(keyWord),
    );
  }

  getTokenData() {
    const payload = {
      limit: 20,
      offset: 0,
      keyword: '',
    };
    this.tokenService.getListCW721Token(payload).subscribe((res: ResponseDto) => {
      res.data.forEach((data) => {
        data['isValueUp'] = true;
        if (data.change < 0) {
          data['isValueUp'] = false;
          data.change = Number(data.change.toString().substring(1));
        }
      });

      this.dataSource = new MatTableDataSource<any>(res.data);
      this.pageData.length = res.meta.count;
    });
  }

  searchToken(): void {
    this.filterSearchData = [];
    if (this.textSearch && this.textSearch.length > 0) {
      this.filterData(this.textSearch);
    }
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  handlePageEvent(e: any) {
    this.pageData = e;
  }

  handleLink(): void {
    this.router.navigate(['/tokens/token/', this.filterSearchData[0]?.tokenContract]);
  }

  sortData(sort: Sort) {
    let data = this.mockData.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'transfer':
          return this.compare(a.transfer, b.transfer, isAsc);
        case 'transfer3d':
          return this.compare(a.transfer3d, b.transfer3d, isAsc);
        default:
          return 0;
      }
    });

    let dataFilter = this.sortedData;
    this.pageData = {
      length: dataFilter.length,
      pageSize: this.pageSize,
      pageIndex: PAGE_EVENT.PAGE_INDEX,
    };
    this.dataSource = new MatTableDataSource<any>(dataFilter);
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
