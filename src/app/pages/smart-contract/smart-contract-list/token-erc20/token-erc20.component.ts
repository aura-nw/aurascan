import {Component, Input, OnInit} from '@angular/core';
import {PageEvent} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {TableTemplate} from "../../../../core/models/common.model";
import {TranslateService} from "@ngx-translate/core";
import {Globals} from "../../../../global/global";
import { PAGE_EVENT } from '../../../../core/constants/common.constant';

@Component({
  selector: 'app-token-erc20',
  templateUrl: './token-erc20.component.html',
  styleUrls: ['./token-erc20.component.scss']
})
export class TokenErc20Component implements OnInit {
  textSearch = '';
  // data table
  mockData = [
    {
      "id": 1,
      "name": "Tether USD (USDT)",
      "desc": "Tether gives you the joint benefits of open blockchain technology and traditional currency by converting your cash into a stable digital currency equivalent.",
      "price": 1.002,
      "change": 0.04,
      "volume": 52379005541,
      "circulatingMarketCap": 74276784332,
      "onChainMarketCap": 39902766084.69,
      "holders": 	4573079,
      "hashCode": "demo_abcdef",
      "btc": 0.000033,
      "eth": 0.000494,
    },
    {
      "id": 2,
      "name": "BNB (BNB)",
      "desc": "Binance aims to build a world-class crypto exchange, powering the future of crypto finance.",
      "price": 30157,
      "change": -0.04,
      "volume": 52379005541,
      "circulatingMarketCap": 74276784332,
      "onChainMarketCap": 39902766084.69,
      "holders": 	4573079,
      "hashCode": "demo_abcdef",
      "btc": 0.000033,
      "eth": 0.000494,
    },
    {
      "id": 3,
      "name": "USD Coin (USDC)",
      "desc": "USDC is a fully collateralized US Dollar stablecoin developed by CENTRE, the open source project with Circle being the first of several forthcoming issuers.",
      "price": 30157,
      "change": 0.04,
      "volume": 52379005541,
      "circulatingMarketCap": 74276784332,
      "onChainMarketCap": 39902766084.69,
      "holders": 	4573079,
      "hashCode": "demo_abcdef",
      "btc": 0.000033,
      "eth": 0.000494,
    },
    {
      "id": 4,
      "name": "HEX (HEX)",
      "desc": "HEX.com averages 25% APY interest recently. HEX virtually lends value from stakers to non-stakers as staking reduces supply. The launch ends Nov. 19th, 2020 when HEX stakers get credited ~200B HEX. HEX's total supply is now ~350B. Audited 3 times, 2 security, and 1 economics.",
      "price": 1.002,
      "change": -0.04,
      "volume": 52379005541,
      "circulatingMarketCap": 74276784332,
      "onChainMarketCap": 39902766084.69,
      "holders": 	4573079,
      "hashCode": "demo_abcdef",
      "btc": 0.000033,
      "eth": 0.000494,
    },
    {
      "id": 5,
      "name": "Binance USD (BUSD)",
      "desc": "Binance USD (BUSD) is a dollar-backed stablecoin issued and custodied by Paxos Trust Company, and regulated by the New York State Department of Financial Services. BUSD is available directly for sale 1:1 with USD on Paxos.com and will be listed for trading on Binance.",
      "price": 30157,
      "change": -0.04,
      "volume": 52379005541,
      "circulatingMarketCap": 74276784332,
      "onChainMarketCap": 39902766084.69,
      "holders": 	4573079,
      "hashCode": "demo_abcdef",
      "btc": 0.000033,
      "eth": 0.000494,
    },
    {
      "id": 6,
      "name": "Wrapped BTC (WBTC)",
      "desc": "Wrapped Bitcoin (WBTC) is an ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.",
      "price": 1.002,
      "change": -0.04,
      "volume": 52379005541,
      "circulatingMarketCap": 74276784332,
      "onChainMarketCap": 39902766084.69,
      "holders": 	4573079,
      "hashCode": "demo_abcdef",
      "btc": 0.000033,
      "eth": 0.000494,
    },
    {
      "id": 7,
      "name": "stETH (stETH)",
      "desc": "stETH is a token that represents staked ether in Lido, combining the value of initial deposit + staking rewards. stETH tokens are pegged 1:1 to the ETH staked with Lido and can be used as one would use ether, allowing users to earn Eth2 staking rewards whilst benefiting from Defi yields.",
      "price": 30157,
      "change": 0.04,
      "volume": 52379005541,
      "circulatingMarketCap": 74276784332,
      "onChainMarketCap": 39902766084.69,
      "holders": 	4573079,
      "hashCode": "demo_abcdef",
      "btc": 0.000033,
      "eth": 0.000494,
    },
    {
      "id": 8,
      "name": "Wrapped liquid staked Ether 2.0 (wstETH)",
      "desc": "wstETH is a wrapped version of stETH. As some DeFi protocols require a constant balance mechanism for tokens, wstETH keeps your balance of stETH fixed and uses an underlying share system to reflect your earned staking rewards.",
      "price": 1.002,
      "change": -0.04,
      "volume": 52379005541,
      "circulatingMarketCap": 74276784332,
      "onChainMarketCap": 39902766084.69,
      "holders": 	4573079,
      "hashCode": "demo_abcdef",
      "btc": 0.000033,
      "eth": 0.000494,
    },
    {
      "id": 9,
      "name": "SHIBA INU (SHIB)",
      "desc": "SHIBA INU is a 100% decentralized community experiment with it claims that 1/2 the tokens have been sent to Vitalik and the other half were locked to a Uniswap pool and the keys burned.",
      "price": 30157,
      "change": 0.04,
      "volume": 52379005541,
      "circulatingMarketCap": 74276784332,
      "onChainMarketCap": 39902766084.69,
      "holders": 	4573079,
      "hashCode": "demo_abcdef",
      "btc": 0.000033,
      "eth": 0.000494,
    },
    {
      "id": 10,
      "name": "Dai Stablecoin (DAI)",
      "desc": "Multi-Collateral Dai, brings a lot of new and exciting features, such as support for new CDP collateral types and Dai Savings Rate.",
      "price": 1.002,
      "change": 0.04,
      "volume": 52379005541,
      "circulatingMarketCap": 74276784332,
      "onChainMarketCap": 39902766084.69,
      "holders": 	4573079,
      "hashCode": "demo_abcdef",
      "btc": 0.000033,
      "eth": 0.000494,
    },
    {
      "id": 11,
      "name": "Matic Token (MATIC)",
      "desc": "Matic Network brings massive scale to Ethereum using an adapted version of Plasma with PoS based side chains. Polygon is a well-structured, easy-to-use platform for Ethereum scaling and infrastructure development.",
      "price": 1.002,
      "change": 0.04,
      "volume": 52379005541,
      "circulatingMarketCap": 74276784332,
      "onChainMarketCap": 39902766084.69,
      "holders": 	4573079,
      "hashCode": "demo_abcdef",
      "btc": 0.000033,
      "eth": 0.000494,
    },
    {
      "id": 12,
      "name": "Theta Token (THETA)",
      "desc": "A decentralized peer-to-peer network that aims to offer improved video delivery at lower costs.",
      "price": 30157,
      "change": 0.04,
      "volume": 52379005541,
      "circulatingMarketCap": 74276784332,
      "onChainMarketCap": 39902766084.69,
      "holders": 	4573079,
      "hashCode": "demo_abcdef",
      "btc": 0.000033,
      "eth": 0.000494,
    },
    {
      "id": 13,
      "name": "Cronos Coin (CRO)",
      "desc": "Pay and be paid in crypto anywhere, with any crypto, for free.",
      "price": 1.002,
      "change": 0.04,
      "volume": 52379005541,
      "circulatingMarketCap": 74276784332,
      "onChainMarketCap": 39902766084.69,
      "holders": 	4573079,
      "hashCode": "demo_abcdef",
      "btc": 0.000033,
      "eth": 0.000494,
    },
    {
      "id": 14,
      "name": "Bitfinex LEO Token (LEO)",
      "desc": "A utility token designed to empower the Bitfinex community and provide utility for those seeking to maximize the output and capabilities of the Bitfinex trading platform.",
      "price": 30157,
      "change": 0.04,
      "volume": 52379005541,
      "circulatingMarketCap": 74276784332,
      "onChainMarketCap": 39902766084.69,
      "holders": 	4573079,
      "hashCode": "demo_abcdef",
      "btc": 0.000033,
      "eth": 0.000494,
    },
  ]
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

  constructor(
      public translate: TranslateService,
      public global: Globals,
      ) { }

  ngOnInit(): void {
    this.getTokenData();

  }

  filterData(keyWord: string) {
    const filterData = this.mockData.filter(data => data.name.includes(keyWord) || data.hashCode.includes(keyWord));
    this.pageData = {
      length: filterData.length,
      pageSize: PAGE_EVENT.PAGE_SIZE,
      pageIndex: PAGE_EVENT.PAGE_INDEX
    };
    this.dataSource = new MatTableDataSource<any>(filterData);
  }

  getTokenData() {
    this.pageData = {
      length: this.mockData.length,
      pageSize: PAGE_EVENT.PAGE_SIZE,
      pageIndex: PAGE_EVENT.PAGE_INDEX
    };
    this.dataSource = new MatTableDataSource<any>(this.mockData);
  }

  searchToken(): void {
    if (this.textSearch.length > 0) {
      this.filterData(this.textSearch);
    } else {
      this.getTokenData();
    }
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }
}
