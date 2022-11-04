import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ResponseDto } from 'src/app/core/models/common.model';
import { AccountService } from 'src/app/core/services/account.service';
import { checkTypeFile } from 'src/app/core/utils/common/info-common';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-nft-list',
  templateUrl: './nft-list.component.html',
  styleUrls: ['./nft-list.component.scss'],
})
export class NftListComponent implements OnChanges {
  @Output() totalValueNft = new EventEmitter<number>();
  image_s3 = this.environmentService.configValue.image_s3;
  defaultImgToken = this.image_s3 + 'images/aura__ntf-default-img.png';
  assetCW721: any[];
  @Input() address: string;
  searchValue = '';
  loading = true;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  nftList = [];
  showedData = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  totalValue = 0;
  nextKey = null;
  currentKey = null;

  constructor(
    private accountService: AccountService,
    private router: Router,
    public global: Globals,
    private environmentService: EnvironmentService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.address) {
      this.nftList = [];
      this.showedData = [];
      this.pageData.pageIndex = PAGE_EVENT.PAGE_INDEX;
      this.pageData.pageSize = 20;
      this.nextKey = null;
      this.currentKey = null;
    }
    this.getNftData();
  }

  getNftData() {
    this.loading = true;
    this.searchValue = this.searchValue?.trim();

    const payload = {
      account_address: this.address,
      limit: 100,
      keyword: this.searchValue,
      next_key: this.nextKey,
    };
    this.accountService.getAssetCW721ByOwner(payload).subscribe((res: ResponseDto) => {
      if (res?.data?.length > 0) {
        if (this.nftList.length > 0) {
          this.nftList = [...this.nftList, ...res.data];
        } else {
          this.nftList = res?.data;
        }
        this.nextKey = res.meta?.next_key;
        this.pageData.length = this.nftList.length;

        this.nftList.forEach((element) => {
          if (element.media_info.length > 0) {
            element.nftType = checkTypeFile(element?.media_info[0]?.media_link);
          }
          if (!this.searchValue) {
            this.totalValue += element.price * +element.balance || 0;
          }
        });
        let start = this.pageData.pageIndex * this.pageData.pageSize;
        let end = this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize;
        this.showedData = this.nftList.slice(start, end);
        this.totalValueNft.emit(this.totalValue);
      } else {
        this.nftList.length = 0;
      }
    });
    this.loading = false;
  }

  resetSearch(): void {
    this.searchValue = '';
    this.pageData.pageIndex = 0;
    this.nftList = [];
    this.nextKey = null;
    this.getNftData();
  }

  searchTokenNft(): void {
    if (this.pageData.pageIndex !== 0) {
      this.pageData.pageIndex = 0;
    } else {
      this.nextKey = null;
      this.nftList = [];
      this.getNftData();
    }
  }

  handlePageEvent(e: any) {
    const { pageIndex, pageSize } = e;
    const next = this.pageData.length <= (pageIndex + 2) * pageSize;

    this.pageData.pageIndex = e.pageIndex;
    if (next && this.nextKey && this.currentKey !== this.nextKey) {
      this.getNftData();
      this.currentKey = this.nextKey;
    } else {
      this.showedData = this.nftList.slice(
        this.pageData.pageIndex * this.pageData.pageSize,
        this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
      );
    }
  }

  handleRouterLink(e: Event, link): void {
    this.router.navigate(link);
    e.preventDefault();
  }

  getTypeFile(nft: any) {
    let nftType = checkTypeFile(nft.animation?.link_s3);
    if (nft?.animation?.content_type) {
      if (nftType === '') {
        switch (nft?.animation?.content_type) {
          case 'video/webm':
          case 'video/mp4':
            nftType = 'video';
            break;
          case 'image/png':
          case 'image/jpeg':
          case 'image/gif':
          case 'application/xml':
            nftType = 'img';
            break;
          case 'model/gltf-binary':
          case 'gltf':
            nftType = '3d';
            break;
          case 'audio/mpeg':
          case 'audio/vnd.wave':
            nftType = 'audio';
            break;
          default:
            nftType = '';
        }
      }
      return nftType;
    } else {
      return '';
    }
  }

  encodeData(data) {
    return encodeURIComponent(data);
  }
}
