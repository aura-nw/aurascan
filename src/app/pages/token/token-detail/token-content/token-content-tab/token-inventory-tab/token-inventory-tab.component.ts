import { Component, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { LENGTH_CHARACTER, PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TokenService } from 'src/app/core/services/token.service';
import { checkTypeFile } from 'src/app/core/utils/common/info-common';

@Component({
  selector: 'app-token-inventory-tab',
  templateUrl: './token-inventory-tab.component.html',
  styleUrls: ['./token-inventory-tab.component.scss'],
})
export class TokenInventoryComponent implements OnInit {
  loading = true;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  nftData: MatTableDataSource<any> = new MatTableDataSource();
  contractAddress = '';
  keyWord = '';
  nextKey = null;
  currentKey = null;

  dataSourceMobile: any[];

  prefixAdd = this.environmentService.configValue.chain_info.bech32Config.bech32PrefixAccAddr;

  constructor(
    private route: ActivatedRoute,
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.contractAddress = params?.contractAddress;
    });

    this.route.queryParams.subscribe((params) => {
      this.keyWord = params?.a || '';
    });
    this.getNftData();
  }

  getNftData() {
    this.loading = true;
    let payload = {
      pageLimit: 100,
      token_id: '',
      owner: '',
      contractAddress: this.contractAddress,
      nextKey: this.nextKey,
    };

    if (this.keyWord) {
      if (this.keyWord?.length >= LENGTH_CHARACTER.ADDRESS && this.keyWord?.startsWith(this.prefixAdd)) {
        payload.owner = this.keyWord;
      } else if (this.keyWord?.length !== LENGTH_CHARACTER.TRANSACTION) {
        payload.token_id = this.keyWord;
      }
    }

    this.tokenService.getListTokenNFTFromIndexer(payload).subscribe((res) => {
      this.nextKey = res.data.nextKey;
      const cw721Asset = _.get(res, 'data.assets.CW721');
      if (this.nftData.data.length > 0) {
        this.nftData.data = [...this.nftData.data, ...cw721Asset.asset];
      } else {
        this.nftData.data = [...cw721Asset.asset];
      }

      this.dataSourceMobile = this.nftData.data.slice(
        this.pageData.pageIndex * this.pageData.pageSize,
        this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
      );
      this.pageData.length = this.nftData.data.length;
      this.loading = false;
    });
  }

  xpageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getNftData();
  }

  pageEvent(e: PageEvent): void {
    const { length, pageIndex, pageSize } = e;
    const next = length <= (pageIndex + 2) * pageSize;
    this.pageData = e;
    this.dataSourceMobile = this.nftData.data.slice(
      this.pageData.pageIndex * this.pageData.pageSize,
      this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
    );

    if (next && this.nextKey && this.currentKey !== this.nextKey) {
      this.getNftData();
      this.currentKey = this.nextKey;
    }
  }

  paginatorEmit(e: MatPaginator): void {
    if (this.nftData.paginator) {
      e.page.next({
        length: this.nftData.paginator.length,
        pageIndex: 0,
        pageSize: this.nftData.paginator.pageSize,
        previousPageIndex: this.nftData.paginator.pageIndex,
      });
      this.nftData.paginator = e;
    } else this.nftData.paginator = e;
  }

  xpaginatorEmit(e): void {
    this.nftData.paginator = e;
  }

  handleRouterLink(e: Event, link, params?): void {
    this.router.navigate(link, {
      queryParams: params,
    });
    e.preventDefault();
  }

  getTypeFile(nft: any) {
    let nftType = checkTypeFile(nft.media_info[0]?.media_link);
    if (nft?.media_info?.length > 0) {
      if (nftType === '') {
        switch (nft?.media_info[0]?.content_type) {
          case 'video/webm':
          case 'video/mp4':
            nftType = 'video';
            break;
          case 'image/png':
          case 'image/jpeg':
          case 'image/gif':
            nftType = 'img';
            break;
          case 'model/gltf-binary':
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
