import { Component, OnInit } from '@angular/core';
import {TableTemplate} from "../../../../core/models/common.model";
import {PageEvent} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {Globals} from "../../../../global/global";

@Component({
  selector: 'app-token-holding-wallet',
  templateUrl: './token-holding-wallet.component.html',
  styleUrls: ['./token-holding-wallet.component.scss']
})
export class TokenHoldingWalletComponent implements OnInit {
  searchValue = null;
  loading = true;
  mockData = [
    {
      id: 1,
      asset: {
        img: 'assets/images/logo/auraTitleLogo.png',
        name: 'Aura'
      },
      symbol: 'AURA',
      contractAddress: {
        address: 'auraeudfg77482e45FdE',
        txtHash: 'auraeudfg77482e45FdE'
      },
      amount: 162772.21382,
      price: {
        value: 21.199,
        auraValue: 0.0054
      },
      change: {
        value: 0.01,
        growthRate: 1
      },
      value: {
        value: 4.12,
        auraValue: 0.001
      },
    },
    {
      id: 2,
      asset: {
        img: 'assets/images/logo/auraTitleLogo.png',
        name: 'Ethereum'
      },
      symbol: 'ETH',
      contractAddress: {
        address: 'auraeudfg77482e45FdE',
        txtHash: 'auraeudfg77482e45FdE'
      },
      amount: 162772.21382,
      price: {
        value: 21.199,
        auraValue: 0.0054
      },
      change: {
        value: 0.01,
        growthRate: -1
      },
      value: {
        value: 4.12,
        auraValue: 0.001
      },
    },
    {
      id: 3,
      asset: {
        img: 'assets/images/logo/auraTitleLogo.png',
        name: 'Gala'
      },
      symbol: 'GALA',
      contractAddress: {
        address: 'auraeudfg77482e45FdE',
        txtHash: 'auraeudfg77482e45FdE'
      },
      amount: 162772.21382,
      price: {
        value: 21.199,
        auraValue: 0.0054
      },
      change: {
        value: 0.01,
        growthRate: 1
      },
      value: {
        value: 4.12,
        auraValue: 0.001
      },
    },
    {
      id: 4,
      asset: {
        img: 'assets/images/logo/auraTitleLogo.png',
        name: 'Kishu Inu'
      },
      symbol: 'KISHU',
      contractAddress: {
        address: 'auraeudfg77482e45FdE',
        txtHash: 'auraeudfg77482e45FdE'
      },
      amount: 162772.21382,
      price: {
        value: 21.199,
        auraValue: 0.0054
      },
      change: {
        value: 0.01,
        growthRate: -1
      },
      value: {
        value: 4.12,
        auraValue: 0.001
      },
    },
    {
      id: 5,
      asset: {
        img: 'assets/images/logo/auraTitleLogo.png',
        name: 'Bitto'
      },
      symbol: 'BITTO',
      contractAddress: {
        address: 'auraeudfg77482e45FdE',
        txtHash: 'auraeudfg77482e45FdE'
      },
      amount: 162772.21382,
      price: {
        value: 21.199,
        auraValue: 0.0054
      },
      change: {
        value: 0.01,
        growthRate: -1
      },
      value: {
        value: 4.12,
        auraValue: 0.001
      },
    },
    {
      id: 6,
      asset: {
        img: 'assets/images/logo/auraTitleLogo.png',
        name: 'PKG Token'
      },
      symbol: 'PKG',
      contractAddress: {
        address: 'auraeudfg77482e45FdE',
        txtHash: 'auraeudfg77482e45FdE'
      },
      amount: 162772.21382,
      price: {
        value: 21.199,
        auraValue: 0.0054
      },
      change: {
        value: 0.01,
        growthRate: 1
      },
      value: {
        value: 4.12,
        auraValue: 0.001
      },
    },
    {
      id: 7,
      asset: {
        img: 'assets/images/logo/auraTitleLogo.png',
        name: 'Tether USD'
      },
      symbol: 'USDT',
      contractAddress: {
        address: 'auraeudfg77482e45FdE',
        txtHash: 'auraeudfg77482e45FdE'
      },
      amount: 162772.21382,
      price: {
        value: 21.199,
        auraValue: 0.0054
      },
      change: {
        value: 0.01,
        growthRate: 1
      },
      value: {
        value: 123.1920,
        auraValue: 0.0054
      },
    },
    {
      id: 8,
      asset: {
        img: 'assets/images/logo/auraTitleLogo.png',
        name: 'USDC'
      },
      symbol: 'USDC',
      contractAddress: {
        address: 'auraeudfg77482e45FdE',
        txtHash: 'auraeudfg77482e45FdE'
      },
      amount: 162772.21382,
      price: {
        value: 21.199,
        auraValue: 0.0054
      },
      change: {
        value: 0.01,
        growthRate: 1
      },
      value: {
        value: 123.1920,
        auraValue: 0.0054
      },
    },
    {
      id: 9,
      asset: {
        img: 'assets/images/logo/auraTitleLogo.png',
        name: 'Cronos Coin'
      },
      symbol: 'CRO',
      contractAddress: {
        address: 'auraeudfg77482e45FdE',
        txtHash: 'auraeudfg77482e45FdE'
      },
      amount: 162772.21382,
      price: {
        value: 21.199,
        auraValue: 0.0054
      },
      change: {
        value: 0.01,
        growthRate: 1
      },
      value: {
        value: 123.1920,
        auraValue: 0.0054
      },
    },
    {
      id: 10,
      asset: {
        img: 'assets/images/logo/auraTitleLogo.png',
        name: 'Binance USD'
      },
      symbol: 'BNB',
      contractAddress: {
        address: 'auraeudfg77482e45FdE',
        txtHash: 'auraeudfg77482e45FdE'
      },
      amount: 162772.21382,
      price: {
        value: 21.199,
        auraValue: 0.0054
      },
      change: {
        value: 0.01,
        growthRate: 1
      },
      value: {
        value: 123.1920,
        auraValue: 0.0054
      },
    },
    {
      id: 11,
      asset: {
        img: 'assets/images/logo/auraTitleLogo.png',
        name: 'BNB'
      },
      symbol: 'BNB',
      contractAddress: {
        address: 'auraeudfg77482e45FdE',
        txtHash: 'auraeudfg77482e45FdE'
      },
      amount: 162772.21382,
      price: {
        value: 21.199,
        auraValue: 0.0054
      },
      change: {
        value: 0.01,
        growthRate: 1
      },
      value: {
        value: 4.12,
        auraValue: 0.001
      },
    },
    {
      id: 12,
      asset: {
        img: 'assets/images/logo/auraTitleLogo.png',
        name: 'Tether USD'
      },
      symbol: 'USDT',
      contractAddress: {
        address: 'auraeudfg77482e45FdE',
        txtHash: 'auraeudfg77482e45FdE'
      },
      amount: 162772.21382,
      price: {
        value: 21.199,
        auraValue: 0.0054
      },
      change: {
        value: 0.01,
        growthRate: -1
      },
      value: {
        value: 4.12,
        auraValue: 0.001
      },
    },
    {
      id: 13,
      asset: {
        img: 'assets/images/logo/auraTitleLogo.png',
        name: 'USD Coin'
      },
      symbol: 'USDC',
      contractAddress: {
        address: 'auraeudfg77482e45FdE',
        txtHash: 'auraeudfg77482e45FdE'
      },
      amount: 162772.21382,
      price: {
        value: 21.199,
        auraValue: 0.0054
      },
      change: {
        value: 0.01,
        growthRate: 1
      },
      value: {
        value: 4.12,
        auraValue: 0.001
      },
    },
    {
      id: 14,
      asset: {
        img: 'assets/images/logo/auraTitleLogo.png',
        name: 'Binance USD'
      },
      symbol: 'BUSD',
      contractAddress: {
        address: 'auraeudfg77482e45FdE',
        txtHash: 'auraeudfg77482e45FdE'
      },
      amount: 162772.21382,
      price: {
        value: 21.199,
        auraValue: 0.0054
      },
      change: {
        value: 0.01,
        growthRate: -1
      },
      value: {
        value: 4.12,
        auraValue: 0.001
      },
    },
    {
      id: 15,
      asset: {
        img: 'assets/images/logo/auraTitleLogo.png',
        name: 'HEX'
      },
      symbol: 'HEX',
      contractAddress: {
        address: 'auraeudfg77482e45FdE',
        txtHash: 'auraeudfg77482e45FdE'
      },
      amount: 162772.21382,
      price: {
        value: 21.199,
        auraValue: 0.0054
      },
      change: {
        value: 0.01,
        growthRate: -1
      },
      value: {
        value: 4.12,
        auraValue: 0.001
      },
    },
    {
      id: 16,
      asset: {
        img: 'assets/images/logo/auraTitleLogo.png',
        name: 'Wrapped BTC'
      },
      symbol: 'WBTC',
      contractAddress: {
        address: 'auraeudfg77482e45FdE',
        txtHash: 'auraeudfg77482e45FdE'
      },
      amount: 162772.21382,
      price: {
        value: 21.199,
        auraValue: 0.0054
      },
      change: {
        value: 0.01,
        growthRate: 1
      },
      value: {
        value: 4.12,
        auraValue: 0.001
      },
    },
    {
      id: 17,
      asset: {
        img: 'assets/images/logo/auraTitleLogo.png',
        name: 'stETH'
      },
      symbol: 'stETH',
      contractAddress: {
        address: 'auraeudfg77482e45FdE',
        txtHash: 'auraeudfg77482e45FdE'
      },
      amount: 162772.21382,
      price: {
        value: 21.199,
        auraValue: 0.0054
      },
      change: {
        value: 0.01,
        growthRate: 1
      },
      value: {
        value: 123.1920,
        auraValue: 0.0054
      },
    },
    {
      id: 18,
      asset: {
        img: 'assets/images/logo/auraTitleLogo.png',
        name: 'Wrapped liquid staked Ether 2.0'
      },
      symbol: 'wstETH',
      contractAddress: {
        address: 'auraeudfg77482e45FdE',
        txtHash: 'auraeudfg77482e45FdE'
      },
      amount: 162772.21382,
      price: {
        value: 21.199,
        auraValue: 0.0054
      },
      change: {
        value: 0.01,
        growthRate: 1
      },
      value: {
        value: 123.1920,
        auraValue: 0.0054
      },
    },
    {
      id: 19,
      asset: {
        img: 'assets/images/logo/auraTitleLogo.png',
        name: 'Dai Stablecoin'
      },
      symbol: 'DAI',
      contractAddress: {
        address: 'auraeudfg77482e45FdE',
        txtHash: 'auraeudfg77482e45FdE'
      },
      amount: 162772.21382,
      price: {
        value: 21.199,
        auraValue: 0.0054
      },
      change: {
        value: 0.01,
        growthRate: 1
      },
      value: {
        value: 123.1920,
        auraValue: 0.0054
      },
    },
    {
      id: 20,
      asset: {
        img: 'assets/images/logo/auraTitleLogo.png',
        name: 'SHIBA INU'
      },
      symbol: 'SHIB',
      contractAddress: {
        address: 'auraeudfg77482e45FdE',
        txtHash: 'auraeudfg77482e45FdE'
      },
      amount: 162772.21382,
      price: {
        value: 21.199,
        auraValue: 0.0054
      },
      change: {
        value: 0.01,
        growthRate: 1
      },
      value: {
        value: 123.1920,
        auraValue: 0.0054
      },
    },
  ];
  templates: Array<TableTemplate> = [
    { matColumnDef: 'asset', headerCellDef: 'asset' },
    { matColumnDef: 'symbol', headerCellDef: 'symbol' },
    { matColumnDef: 'contractAddress', headerCellDef: 'contractAddress' },
    { matColumnDef: 'amount', headerCellDef: 'amount' },
    { matColumnDef: 'price', headerCellDef: 'price' },
    { matColumnDef: 'change', headerCellDef: 'change' },
    { matColumnDef: 'value', headerCellDef: 'value' },
    { matColumnDef: 'action', headerCellDef: 'action' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  constructor(public global: Globals) { }

  ngOnInit(): void {
    this.getTokenData();
  }

  getTokenData() {
    this.pageData = {
      length: this.mockData.length,
      pageSize: 10,
      pageIndex: 1,
    };
    this.loading = true;
    this.dataSource = new MatTableDataSource<any>(this.mockData);
    this.loading = false;
  }

  handleSearch() {
    const filterData = this.mockData.filter(
        (data) => data.asset.name.includes(this.searchValue) || data.contractAddress.txtHash.includes(this.searchValue),
    );
    if (filterData.length > 0) {
      this.pageData = {
        length: filterData.length,
        pageSize: 10,
        pageIndex: 1,
      };
      this.dataSource = new MatTableDataSource<any>(filterData);
    }
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }
}
