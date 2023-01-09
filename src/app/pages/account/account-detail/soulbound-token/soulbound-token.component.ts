import { Component, Input, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-soulbound-token',
  templateUrl: './soulbound-token.component.html',
  styleUrls: ['./soulbound-token.component.scss'],
})
export class SoulboundTokenComponent implements OnInit {
  @Input() address: string;

  assetSoulBound: any[];
  searchValue = '';
  loading = true;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  showedData = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  paginator: MatPaginator;

  constructor(private router: Router, public global: Globals) {}

  ngOnInit(): void {
    this.getNftData();
  }

  getNftData() {
    this.loading = true;
    const payload = {
      account_address: this.address,
      limit: this.pageData.pageSize,
      offset: this.pageData.pageSize * this.pageData.pageIndex,
      keyword: this.searchValue,
    };

    if (this.pageData) {
      this.pageData.length = this.assetSoulBound?.length || 0;
      const { pageIndex, pageSize } = this.pageData;
      const start = pageIndex * pageSize;
      const end = start + pageSize;
      this.showedData = this.assetSoulBound.slice(start, end);
    }
    this.loading = false;
  }

  paginatorEmit(event): void {
    this.paginator = event;
  }

  resetSearch(): void {
    this.searchValue = '';
    this.getNftData();
  }

  getKeySearch() {
    this.searchValue = this.searchValue?.trim();
    this.getNftData();
  }

  searchTokenNft(): void {
    if (this.paginator.pageIndex !== 0) {
      this.paginator.firstPage();
    } else {
      this.getKeySearch();
    }
  }

  checkSearch(): void {
    if (this.searchValue.length === 0) {
      this.searchTokenNft();
    }
  }

  handlePageEvent(e: any) {
    this.pageData.pageIndex = e.pageIndex;
    this.getKeySearch();
  }
}
