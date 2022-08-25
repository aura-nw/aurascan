import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
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
    pageSize: 10,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  nftData = [];
  showedData = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  totalValue = 0;

  constructor(private accountService: AccountService, private router: Router, public global: Globals) {}

  ngOnChanges(): void {
    this.getNftData();
    this.pageData = {
      length: 0,
      pageSize: 20,
      pageIndex: 0,
    };
  }

  getNftData() {
    this.loading = true;
    const payload = {
      account_address: this.address,
      limit: 0,
      offset: 0,
      keyword: this.searchValue,
    };
    this.accountService.getAssetCW721ByOwner(payload).subscribe((res: ResponseDto) => {
      if (res?.data?.length > 0) {
        this.assetCW721 = res?.data;
        this.assetCW721.length = res.data.length;

        res?.data.forEach((element) => {
          if (!this.searchValue) {
            this.totalValue += element.price * +element.balance || 0;
          }
        });
        this.totalValueNft.emit(this.totalValue);

        if (this.pageData) {
          this.pageData.length = this.assetCW721?.length || 0;
          const { pageIndex, pageSize } = this.pageData;
          const start = pageIndex * pageSize;
          const end = start + pageSize;
          this.showedData = this.assetCW721.slice(start, end);
        }
      } else {
        this.showedData.length = 0;
      }
    });
    this.loading = false;
  }

  handleSearch() {
    const VALIDATORS = {
      HASHRULE: /^[A-Za-z0-9]/,
    };
    const regexRule = VALIDATORS.HASHRULE;
    this.searchValue = this.searchValue?.trim();
    if (this.searchValue.length > 0) {
      if (regexRule.test(this.searchValue)) {
        this.getNftData();
      }
    } else {
      this.getNftData();
    }
  }

  paginatorEmit(event): void {
    this.pageData = {
      ...event,
      length: this.assetCW721?.length,
    };
    this.getNftData();
  }

  resetSearch(): void {
    this.searchValue = '';
    this.getNftData();
  }

  handleRouterLink(e: Event, link): void {
    this.router.navigate(link);
    e.preventDefault();
  }
}
