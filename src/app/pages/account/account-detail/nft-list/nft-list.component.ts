import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { ResponseDto } from 'src/app/core/models/common.model';
import { AccountService } from 'src/app/core/services/account.service';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-nft-list',
  templateUrl: './nft-list.component.html',
  styleUrls: ['./nft-list.component.scss'],
})
export class NftListComponent implements OnChanges {
  @Output() totalValueNft = new EventEmitter<number>();

  assetCW721: any[];
  @Input() address: string;
  searchValue = '';
  loading = true;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  nftData = [];
  showedData = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  totalValue = 0;
  paginator: MatPaginator;

  constructor(private accountService: AccountService, private router: Router, public global: Globals) {}

  ngOnChanges(): void {
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
    this.accountService.getAssetCW721ByOwner(payload).subscribe((res: ResponseDto) => {
      if (res?.data?.length > 0) {
        this.showedData = res?.data;
        this.pageData.length = res.meta.count;

        res?.data.forEach((element) => {
          if (!this.searchValue) {
            this.totalValue += element.price * +element.balance || 0;
          }
        });
        this.totalValueNft.emit(this.totalValue);
      } else {
        this.showedData.length = 0;
      }
    });
    this.loading = false;
  }

  paginatorEmit(event): void {
    this.paginator = event;
  }

  resetSearch(): void {
    this.searchValue = '';
    this.pageData.pageIndex = 0;
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

  handleRouterLink(e: Event, link): void {
    this.router.navigate(link);
    e.preventDefault();
  }
}
