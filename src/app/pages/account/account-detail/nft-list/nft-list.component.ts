import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-nft-list',
  templateUrl: './nft-list.component.html',
  styleUrls: ['./nft-list.component.scss'],
})
export class NftListComponent implements OnInit, OnChanges {
  @Input() assetCW721: any[];
  searchValue = null;
  loading = true;
  pageData: PageEvent;
  nftData = [];
  showedData = [];

  constructor() {}

  ngOnInit(): void {
    this.pageData = {
      length: 0,
      pageSize: 10,
      pageIndex: 0,
    };
  }

  ngOnChanges(): void {
    this.getNftData();
  }

  getNftData() {
    this.loading = true;
    if (this.pageData) {
      this.pageData.length = this.assetCW721?.length || 0;
      const { pageIndex, pageSize } = this.pageData;
      const start = pageIndex * pageSize;
      const end = start + pageSize;
      this.showedData = this.assetCW721.slice(start, end);
    }

    this.loading = false;
  }

  handleSearch() {
    this.pageData = {
      length: this.assetCW721.length,
      pageSize: 10,
      pageIndex: 1,
    };
  }

  paginatorEmit(event): void {
    this.pageData = {
      ...event,
      length: this.assetCW721?.length,
    };
    this.getNftData();
  }
}
