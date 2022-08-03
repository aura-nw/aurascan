import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ADDRESS_PREFIX } from '../../../../core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN, TOKEN_TAB } from '../../../../core/constants/token.constant';
import { TokenTab } from '../../../../core/constants/token.enum';

@Component({
  selector: 'app-token-content',
  templateUrl: './token-content.component.html',
  styleUrls: ['./token-content.component.scss'],
})
export class TokenContentComponent implements OnInit {
  @Input() isNFTContract: boolean;
  @Input() tokenID: string;
  tabToken = [TokenTab.Transfers, TokenTab.Holders, TokenTab.Info, TokenTab.Contract, TokenTab.Analytics];
  tabNFT = [TokenTab.Transfers, TokenTab.Holders, TokenTab.Inventory, TokenTab.Info, TokenTab.Contract];
  TABS = TOKEN_TAB.filter((vote) => this.tabToken.includes(vote.key)).map((vote) => ({
    ...vote,
    value: vote.value,
    key: vote.key === TokenTab.Transfers ? '' : vote.key,
  }));
  countCurrent: string = '';
  textSearch: string = '';
  searchTemp: string = '';
  isSearchTx = false;
  isSearchAddress = false;
  resultSearch = 0;
  tokenTab = TokenTab;
  tabsBackup: any;
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchTemp = params?.a || '';
    });

    this.TABS = TOKEN_TAB.filter((vote) => (this.isNFTContract ? this.tabNFT : this.tabToken).includes(vote.key)).map(
      (vote) => ({
        ...vote,
        value: vote.value,
        key: vote.key === TokenTab.Transfers ? '' : vote.key,
      }),
    );
    this.tabsBackup = this.TABS;
  }

  changeTab(tabId): void {
    this.countCurrent = tabId;
  }

  handleSearch() {
    const VALIDATORS = {
      HASHRULE: /^[A-Za-z0-9]/,
    };
    const regexRule = VALIDATORS.HASHRULE;
    this.searchTemp = this.searchTemp?.trim();
    this.isSearchTx = false;
    this.TABS = this.tabsBackup;
    if (regexRule.test(this.searchTemp)) {
      this.textSearch = this.searchTemp;
      setTimeout(() => {
        if (this.resultSearch > 0) {
          let tempTabs;
          if (this.textSearch.length > 60) {
            this.isSearchTx = true;
            tempTabs = this.TABS.filter((k) => k.key !== TokenTab.Holders && k.key !== TokenTab.Analytics);
          } else if (this.textSearch?.length >= 43 && this.textSearch?.startsWith(ADDRESS_PREFIX)) {
            this.isSearchAddress = true;
            tempTabs = this.TABS.filter((k) => k.key !== TokenTab.Holders);
          }
          this.TABS = tempTabs || this.tabsBackup;
        }
      }, 500);
    } else {
      this.textSearch = '';
    }
  }

  getLength(result: string) {
    this.resultSearch = Number(result) || 0;
  }

  resetSearch() {
    const params = { ...this.route.snapshot.params };
    console.log(params);
    this.router.navigate([`tokens/token`, params]);

    // delete params.esid;
    // this.route.navigate([], { queryParams: params });

    // this.searchTemp = null;
    // this.textSearch = null;
    // this.isSearchAddress = false;
    // this.isSearchTx = false;
    // const params = { ...this.route.snapshot.queryParams };
    //     delete params.esid;
    //     this.router.navigate([], { queryParams: params });
    // this.handleSearch();
  }
}
