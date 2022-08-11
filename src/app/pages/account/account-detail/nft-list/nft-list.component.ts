import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { ResponseDto } from 'src/app/core/models/common.model';
import { AccountService } from 'src/app/core/services/account.service';

@Component({
  selector: 'app-nft-list',
  templateUrl: './nft-list.component.html',
  styleUrls: ['./nft-list.component.scss'],
})
export class NftListComponent implements OnInit, OnChanges {
  assetCW721: any[];
  @Input() address: string;
  searchValue = null;
  loading = true;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  nftData = [];
  showedData = [];
  filterSearchData = [];

  constructor(private accountService: AccountService) {}

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
    const payload = {
      account_address: this.address,
      limit: 0,
      offset: 0,
      keyword: '',
    };
    this.accountService.getAssetCW721ByOnwer(payload).subscribe((res: ResponseDto) => {
      if (res?.data?.length > 0) {
        this.assetCW721 = res?.data;
        this.assetCW721.length = res.data.length;
        if (this.pageData) {
          this.pageData.length = this.assetCW721?.length || 0;
          const { pageIndex, pageSize } = this.pageData;
          const start = pageIndex * pageSize;
          const end = start + pageSize;
          this.showedData = this.assetCW721.slice(start, end);
        }
      }
    });
    this.loading = false;
  }

  // getNftData() {
  //   this.loading = true;
  //   if (this.pageData) {
  //     this.pageData.length = this.assetCW721?.length || 0;
  //     const { pageIndex, pageSize } = this.pageData;
  //     const start = pageIndex * pageSize;
  //     const end = start + pageSize;
  //     this.showedData = this.assetCW721.slice(start, end);
  //   }
  //   this.loading = false;
  // }

  handleSearch() {
    console.log(this.searchValue.length);
    
    if (this.searchValue.length > 0) {
      const payload = {
        account_address: this.address,
        limit: 0,
        offset: 0,
        keyword: this.searchValue,
      };
      this.accountService.getAssetCW721ByOnwer(payload).subscribe((res: ResponseDto) => {
        if (res?.data?.length > 0) {
          let keyWord = this.searchValue.toLowerCase();
          this.filterSearchData = res.data?.filter(
            (data) => data.contract_name.toLowerCase().includes(keyWord) || data.token_id.toLowerCase().includes(keyWord),
          );
        }
      });
    }
  }

  paginatorEmit(event): void {
    this.pageData = {
      ...event,
      length: this.assetCW721?.length,
    };
    this.getNftData();
  }
}
