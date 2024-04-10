import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LENGTH_CHARACTER, PAGE_EVENT, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { ETokenNFTTypeBE, MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { AccountService } from 'src/app/core/services/account.service';
import { checkTypeFile } from 'src/app/core/utils/common/info-common';

@Component({
  selector: 'app-nft-list',
  templateUrl: './nft-list.component.html',
  styleUrls: ['./nft-list.component.scss'],
})
export class NftListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() address: string;
  @Output() totalValueNft = new EventEmitter<number>();

  searchValue = '';
  loading = true;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: 1,
  };
  nftFilter = '';
  nftFilterItem = null;
  nftList = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  totalValue = 0;
  textSearch = '';
  searchNotFound = false;
  typeToken = '';
  typeTokeList = ETokenNFTTypeBE;
  listCollection = [
    {
      label: 'All',
      quantity: 0,
      address: '',
    },
  ];
  errTxt: string;
  destroyed$ = new Subject<void>();
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(takeUntil(this.destroyed$));

  constructor(
    private accountService: AccountService,
    private layout: BreakpointObserver,
    private router: Router,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.address) {
      this.pageEvent(0);
    }
  }

  ngOnInit(): void {
    this.getListCollection();
    this.setNFTFilter(this.listCollection[0]);
  }

  /**
   * ngOnDestroy
   */
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  filterCollecttion() {
    this.pageData.pageIndex = 1;
    this.getNftData();
  }

  getNftData() {
    const payload = {
      owner: this.address,
      limit: this.pageData.pageSize,
      keyword: this.textSearch,
      offset: (this.pageData.pageIndex - 1) * this.pageData.pageSize,
      address: this.nftFilter || null,
    };

    // TODO, set null list erc721
    if (this.typeToken === ETokenNFTTypeBE.ERC721) {
      this.pageData.length = 0;
      this.searchNotFound = true;
      this.nftList = [];
      return;
    }

    if (this.nftFilter) {
      if (this.textSearch.length === LENGTH_CHARACTER.CONTRACT && this.textSearch !== this.nftFilter) {
        this.nftList = [];
        this.searchNotFound = true;
        this.pageData.length = 0;
        return;
      }
    }

    this.accountService.getAssetCW721ByOwner(payload).subscribe({
      next: (res) => {
        if (res?.cw721_token?.length === 0) {
          if (this.textSearch?.length > 0) {
            this.searchNotFound = true;
          }
          this.pageData.length = 0;
          this.nftList = [];
          return;
        }

        this.nftList = res?.cw721_token;
        this.nftList?.forEach((element) => {
          element.contract_address = _.get(element, 'cw721_contract.smart_contract.address');
          element.token_name = _.get(element, 'cw721_contract.name');
          if (!this.searchValue) {
            this.totalValue += element.price * +element.balance || 0;
          }
        });
        this.totalValueNft.emit(this.totalValue);
        this.accountService.countAssetCW721ByOwner(payload).subscribe((countData) => {
          this.pageData.length = countData?.cw721_token_aggregate?.aggregate?.count || 0;
        });
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.status + ' ' + e.statusText;
        }
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  getListCollection() {
    const payload = {
      owner: this.address,
    };

    this.accountService.getListCollectionByOwner(payload).subscribe({
      next: (res) => {
        if (res?.cw721_contract?.length > 0) {
          this.listCollection = [
            {
              label: 'All',
              quantity: 0,
              address: '',
            },
          ];
          res.cw721_contract?.forEach((item) => {
            this.listCollection?.push({
              label: item.name,
              quantity: item.cw721_tokens_aggregate.aggregate.count,
              address: item.smart_contract.address,
            });
          });

          this.accountService.countListCollectionByOwner(payload).subscribe((countData) => {
            this.listCollection[0].quantity = countData?.cw721_token_aggregate?.aggregate?.count;
            this.setNFTFilter(this.listCollection[0]);
          });
        }
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.status + ' ' + e.statusText;
        }
      },
    });
  }

  setNFTFilter(nft) {
    this.nftFilterItem = nft;
  }

  resetSearch(): void {
    this.searchValue = '';
    this.textSearch = '';
    this.searchNotFound = false;
    this.pageEvent(0);
  }

  searchTokenNft(): void {
    this.searchValue = this.searchValue?.trim();
    this.textSearch = this.searchValue;
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
    this.router.navigate([link]);
  }

  getTypeFile(nft: any) {
    let nftType = checkTypeFile(nft);
    return nftType;
  }

  encodeData(data) {
    return encodeURIComponent(data);
  }

  changeType(type: string): void {
    this.typeToken = type;
    this.getNftData();
  }
}
