import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PAGE_EVENT } from '../../../../core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from '../../../../core/constants/token.constant';
import { TableTemplate } from '../../../../core/models/common.model';
import { Globals } from '../../../../global/global';

@Component({
  selector: 'app-token-cw20',
  templateUrl: './token-cw20.component.html',
  styleUrls: ['./token-cw20.component.scss'],
})
export class TokenCw20Component implements OnInit {
  textSearch = '';
  // data table
  mockData = [
    {
      id: 1,
      name: 'Tether USD (USDT)',
      desc: 'Tether gives you the joint benefits of open blockchain technology and traditional currency by converting your cash into a stable digital currency equivalent.',
      price: 1.002,
      change: 0.12,
      volume: 529005541,
      circulatingMarketCap: 44276784332,
      onChainMarketCap: 39902766084.69,
      holders: 4573079,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 2,
      name: 'BNB (BNB)',
      desc: 'Binance aims to build a world-class crypto exchange, powering the future of crypto finance.',
      price: 30157,
      change: -0.22,
      volume: 5541,
      circulatingMarketCap: 24276784332,
      onChainMarketCap: 39902766084.69,
      holders: 4573079,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 3,
      name: 'USD Coin (USDC)',
      desc: 'USDC is a fully collateralized US Dollar stablecoin developed by CENTRE, the open source project with Circle being the first of several forthcoming issuers.',
      price: 57,
      change: 0.33,
      volume: 79005541,
      circulatingMarketCap: 14276784332,
      onChainMarketCap: 39902766084.69,
      holders: 4573079,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 4,
      name: 'HEX (HEX)',
      desc: "HEX.com averages 25% APY interest recently. HEX virtually lends value from stakers to non-stakers as staking reduces supply. The launch ends Nov. 19th, 2020 when HEX stakers get credited ~200B HEX. HEX's total supply is now ~350B. Audited 3 times, 2 security, and 1 economics.",
      price: 1.002,
      change: -0.02,
      volume: 579005541,
      circulatingMarketCap: 74276784332,
      onChainMarketCap: 39902766084.69,
      holders: 4573079,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 5,
      name: 'Binance USD (BUSD)',
      desc: 'Binance USD (BUSD) is a dollar-backed stablecoin issued and custodied by Paxos Trust Company, and regulated by the New York State Department of Financial Services. BUSD is available directly for sale 1:1 with USD on Paxos.com and will be listed for trading on Binance.',
      price: 22157,
      change: -0.34,
      volume: 379005541,
      circulatingMarketCap: 94276784332,
      onChainMarketCap: 39902766084.69,
      holders: 4573079,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 6,
      name: 'Wrapped BTC (WBTC)',
      desc: 'Wrapped Bitcoin (WBTC) is an ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
      price: 1.002,
      change: -0.54,
      volume: 52375541,
      circulatingMarketCap: 54276784332,
      onChainMarketCap: 39902766084.69,
      holders: 4573079,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 7,
      name: 'stETH (stETH)',
      desc: 'stETH is a token that represents staked ether in Lido, combining the value of initial deposit + staking rewards. stETH tokens are pegged 1:1 to the ETH staked with Lido and can be used as one would use ether, allowing users to earn Eth2 staking rewards whilst benefiting from Defi yields.',
      price: 11157,
      change: 0.67,
      volume: 5205541,
      circulatingMarketCap: 66276784332,
      onChainMarketCap: 39902766084.69,
      holders: 4573079,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 8,
      name: 'Wrapped liquid staked Ether 2.0 (wstETH)',
      desc: 'wstETH is a wrapped version of stETH. As some DeFi protocols require a constant balance mechanism for tokens, wstETH keeps your balance of stETH fixed and uses an underlying share system to reflect your earned staking rewards.',
      price: 1333.002,
      change: -0.2,
      volume: 5235541,
      circulatingMarketCap: 88276784332,
      onChainMarketCap: 39902766084.69,
      holders: 4573079,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 9,
      name: 'SHIBA INU (SHIB)',
      desc: 'SHIBA INU is a 100% decentralized community experiment with it claims that 1/2 the tokens have been sent to Vitalik and the other half were locked to a Uniswap pool and the keys burned.',
      price: 64157,
      change: 0.15,
      volume: 579005541,
      circulatingMarketCap: 34276784332,
      onChainMarketCap: 39902766084.69,
      holders: 4573079,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 10,
      name: 'Dai Stablecoin (DAI)',
      desc: 'Multi-Collateral Dai, brings a lot of new and exciting features, such as support for new CDP collateral types and Dai Savings Rate.',
      price: 0.8602,
      change: 0.34,
      volume: 52379541,
      circulatingMarketCap: 43276784332,
      onChainMarketCap: 39902766084.69,
      holders: 4573079,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 11,
      name: 'Matic Token (MATIC)',
      desc: 'Matic Network brings massive scale to Ethereum using an adapted version of Plasma with PoS based side chains. Polygon is a well-structured, easy-to-use platform for Ethereum scaling and infrastructure development.',
      price: 44.002,
      change: 0.04,
      volume: 52379005541,
      circulatingMarketCap: 74276784332,
      onChainMarketCap: 39902766084.69,
      holders: 22222,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 12,
      name: 'Theta Token (THETA)',
      desc: 'A decentralized peer-to-peer network that aims to offer improved video delivery at lower costs.',
      price: 3157,
      change: 0.04,
      volume: 52379005541,
      circulatingMarketCap: 74276784332,
      onChainMarketCap: 39902766084.69,
      holders: 33333,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 13,
      name: 'Cronos Coin (CRO)',
      desc: 'Pay and be paid in crypto anywhere, with any crypto, for free.',
      price: 1.002,
      change: 0.04,
      volume: 52379005541,
      circulatingMarketCap: 74276784332,
      onChainMarketCap: 39902766084.69,
      holders: 654645,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 14,
      name: 'Bitfinex LEO Token (LEO)',
      desc: 'A utility token designed to empower the Bitfinex community and provide utility for those seeking to maximize the output and capabilities of the Bitfinex trading platform.',
      price: 30157,
      change: 0.04,
      volume: 52379005541,
      circulatingMarketCap: 74276784332,
      onChainMarketCap: 39902766084.69,
      holders: 4324,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 15,
      name: 'XRP (XPR)',
      desc: 'A utility token designed to empower the Bitfinex community and provide utility for those seeking to maximize the output and capabilities of the Bitfinex trading platform.',
      price: 0.32,
      change: 0.04,
      volume: 52379005541,
      circulatingMarketCap: 74276784332,
      onChainMarketCap: 39902766084.69,
      holders: 345,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 16,
      name: 'Cardano (ADA)',
      desc: 'A utility token designed to empower the Bitfinex community and provide utility for those seeking to maximize the output and capabilities of the Bitfinex trading platform.',
      price: 0.46,
      change: 0.04,
      volume: 52379005541,
      circulatingMarketCap: 74276784332,
      onChainMarketCap: 39902766084.69,
      holders: 1234,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 17,
      name: 'Solana (SOL)',
      desc: 'A utility token designed to empower the Bitfinex community and provide utility for those seeking to maximize the output and capabilities of the Bitfinex trading platform.',
      price: 32.67,
      change: 0.04,
      volume: 52379005541,
      circulatingMarketCap: 74276784332,
      onChainMarketCap: 39902766084.69,
      holders: 333332,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 18,
      name: 'Dogecoin (DOGE)',
      desc: 'A utility token designed to empower the Bitfinex community and provide utility for those seeking to maximize the output and capabilities of the Bitfinex trading platform.',
      price: 0.06,
      change: 0.04,
      volume: 52379005541,
      circulatingMarketCap: 74276784332,
      onChainMarketCap: 39902766084.69,
      holders: 65654,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 19,
      name: 'TRON (TRX)',
      desc: 'A utility token designed to empower the Bitfinex community and provide utility for those seeking to maximize the output and capabilities of the Bitfinex trading platform.',
      price: 0.064,
      change: 0.04,
      volume: 52379005541,
      circulatingMarketCap: 74276784332,
      onChainMarketCap: 39902766084.69,
      holders: 43543,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 20,
      name: 'Polkadot (DOT)',
      desc: 'A utility token designed to empower the Bitfinex community and provide utility for those seeking to maximize the output and capabilities of the Bitfinex trading platform.',
      price: 6.92,
      change: 0.04,
      volume: 52379005541,
      circulatingMarketCap: 74276784332,
      onChainMarketCap: 39902766084.69,
      holders: 76575,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 21,
      name: 'Litecoin (LTC)',
      desc: 'A utility token designed to empower the Bitfinex community and provide utility for those seeking to maximize the output and capabilities of the Bitfinex trading platform.',
      price: 53,
      change: 0.04,
      volume: 52379005541,
      circulatingMarketCap: 74276784332,
      onChainMarketCap: 39902766084.69,
      holders: 34533,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
    {
      id: 22,
      name: 'Chainlink (LINK)',
      desc: 'A utility token designed to empower the Bitfinex community and provide utility for those seeking to maximize the output and capabilities of the Bitfinex trading platform.',
      price: 6.12,
      change: 0.04,
      volume: 52379005541,
      circulatingMarketCap: 74276784332,
      onChainMarketCap: 39902766084.69,
      holders: 1231235,
      hashCode: 'demo_abcdef',
      btc: 0.000033,
      eth: 0.000494,
    },
  ];
  templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'id' },
    { matColumnDef: 'token', headerCellDef: 'name' },
    { matColumnDef: 'price', headerCellDef: 'price' },
    { matColumnDef: 'change', headerCellDef: 'change' },
    { matColumnDef: 'volume', headerCellDef: 'volume' },
    { matColumnDef: 'circulatingMarketCap', headerCellDef: 'circulatingMarketCap' },
    { matColumnDef: 'onChainMarketCap', headerCellDef: 'onChainMarketCap' },
    { matColumnDef: 'holders', headerCellDef: 'holders' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  sortedData: any;
  sort: MatSort;
  filterSearchData = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  pageSize = 20;

  constructor(public translate: TranslateService, public global: Globals, private router: Router) {}

  ngOnInit(): void {
    this.getTokenData();
  }

  filterData(keyWord: string) {
    keyWord = keyWord.toLowerCase();
    this.filterSearchData = this.mockData.filter(
      (data) => data.name.toLowerCase().includes(keyWord) || data.hashCode.toLowerCase().includes(keyWord),
    );
  }

  getTokenData() {
    this.pageData = {
      length: this.mockData.length,
      pageSize: this.pageSize,
      pageIndex: PAGE_EVENT.PAGE_INDEX,
    };

    this.mockData.forEach((data) => {
      data['isValueUp'] = true;
      if (data.change < 0) {
        data['isValueUp'] = false;
        data.change = Number(data.change.toString().substring(1));
      }
    });
    let data = this.mockData.slice();

    this.sortedData = data.sort((a, b) => {
      return this.compare(a.circulatingMarketCap, b.circulatingMarketCap, false);
    });

    this.mockData = this.sortedData;
    this.dataSource = new MatTableDataSource<any>(this.mockData);
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

  sortData(sort: Sort) {
    let data = this.mockData.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'price':
          return this.compare(a.price, b.price, false);
        case 'volume':
          return this.compare(a.volume, b.volume, false);
        case 'circulatingMarketCap':
          return this.compare(a.circulatingMarketCap, b.circulatingMarketCap, true);
        default:
          return 0;
      }
    });

    if (sort.active === 'change') {
      let lstUp = this.sortedData
        .filter((data) => data.isValueUp)
        ?.sort((a, b) => this.compare(a.change, b.change, false));
      let lstDown = this.sortedData
        .filter((data) => !data.isValueUp)
        .sort((a, b) => this.compare(a.change, b.change, true));
      this.sortedData = lstUp.concat(lstDown);
    }

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

  handleLink(): void {
    this.router.navigate(['/token/token', this.filterSearchData[0]?.hashCode]);
  }
  handlePageEvent(e: any) {
    this.pageData = e;
  }
}
