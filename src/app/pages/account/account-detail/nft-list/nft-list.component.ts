import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import * as _ from 'lodash';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { AccountService } from 'src/app/core/services/account.service';
import { checkTypeFile } from 'src/app/core/utils/common/info-common';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-nft-list',
  templateUrl: './nft-list.component.html',
  styleUrls: ['./nft-list.component.scss'],
})
export class NftListComponent implements OnChanges {
  @Input() address: string;
  @Output() totalValueNft = new EventEmitter<number>();
  image_s3 = this.environmentService.configValue.image_s3;
  searchValue = '';
  loading = true;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: 1,
  };
  nftList = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  totalValue = 0;

  constructor(
    private accountService: AccountService,
    public global: Globals,
    private environmentService: EnvironmentService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.address) {
      this.pageEvent(0);
    }
  }

  getNftData() {
    this.searchValue = this.searchValue?.trim();
    const payload = {
      owner: this.address,
      limit: this.pageData.pageSize,
      keyword: this.searchValue,
      offset: (this.pageData.pageIndex - 1) * this.pageData.pageSize,
    };

    this.accountService.getAssetCW721ByOwner(payload).subscribe(
      (res) => {
        if (res?.cw721_token?.length > 0) {
          this.nftList = res?.cw721_token;
          this.pageData.length = res.cw721_token_aggregate?.aggregate?.count;

          this.nftList.forEach((element) => {
            element.contract_address = _.get(element, 'cw721_contract.smart_contract.address');
            element.token_name = _.get(element, 'cw721_contract.name');
            if (!this.searchValue) {
              this.totalValue += element.price * +element.balance || 0;
            }
          });
          this.totalValueNft.emit(this.totalValue);
        } else {
          this.pageData.length = 0;
        }
      },
      () => {},
      () => {
        this.loading = false;
      },
    );
  }

  resetSearch(): void {
    this.searchValue = '';
    this.pageEvent(0);
  }

  searchTokenNft(): void {
    this.pageEvent(0);
  }

  pageEvent(pageIndex: number): void {
    // reset page 1 if pageIndex = 0
    if (pageIndex === 0) {
      this.pageData.pageIndex = 1;
    }
    this.getNftData();
  }

  handleRouterLink(link): void {
    window.location.href = link;
  }

  getTypeFile(nft: any) {
    let nftType = checkTypeFile(nft);
    return nftType;
  }

  encodeData(data) {
    return encodeURIComponent(data);
  }
}
