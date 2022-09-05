import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {PAGE_EVENT} from "src/app/core/constants/common.constant";
import {MAX_LENGTH_SEARCH_TOKEN} from "src/app/core/constants/token.constant";
import {AccountService} from "src/app/core/services/account.service";
import {Router} from "@angular/router";
import {Globals} from "src/app/global/global";
import {ResponseDto} from "src/app/core/models/common.model";

@Component({
  selector: 'app-soulbound-token',
  templateUrl: './soulbound-token.component.html',
  styleUrls: ['./soulbound-token.component.scss']
})
export class SoulboundTokenComponent implements OnInit {
  @Output() totalValueNft = new EventEmitter<number>();

  assetSoulBound: any[];
  @Input() address: string;
  searchValue = '';
  loading = true;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  showedData = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  totalValue = 2182.64;
  paginator: MatPaginator;

  constructor(private accountService: AccountService, private router: Router, public global: Globals) { }

  ngOnInit(): void {
    this.getNftData();
  }

  // ngOnChanges(): void {
  //   this.getNftData();
  // }

  getNftData() {
    this.loading = true;
    const payload = {
      account_address: this.address,
      limit: 0,
      offset: 0,
      keyword: this.searchValue,
    };
    this.assetSoulBound = [
      {
        contract_address: '',
        token_id: '',
        uri: '',
        name: 'Euphoria Companion',
        status: 'On-chain',
      },
      {
        contract_address: '',
        token_id: '',
        uri: '',
        name: 'Euphoria Companion',
        status: 'On-chain',
      }
    ]

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
