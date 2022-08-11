import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LENGTH_CHARACTER } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { AccountService } from 'src/app/core/services/account.service';
import { Globals } from 'src/app/global/global';
import { MAX_LENGTH_SEARCH_TOKEN, TOKEN_TAB } from '../../../../core/constants/token.constant';
import { TokenTab } from '../../../../core/constants/token.enum';

@Component({
  selector: 'app-token-content',
  templateUrl: './token-content.component.html',
  styleUrls: ['./token-content.component.scss'],
})
export class TokenContentComponent implements OnInit {
  @Input() tokenDetail: any;
  @Input() contractAddress: string;
  tabToken = [TokenTab.Transfers, TokenTab.Holders, TokenTab.Info, TokenTab.Contract, TokenTab.Analytics];
  tabNFT = [TokenTab.Transfers, TokenTab.Holders, TokenTab.Inventory, TokenTab.Info, TokenTab.Contract];
  TABS = [];
  countCurrent: string = '';
  paramQuery = '';
  textSearch: string = '';
  searchTemp: string = '';
  isSearchTx = false;
  isSearchAddress = false;
  resultSearch = 0;
  tokenTab = TokenTab;
  tabsBackup: any;
  infoSearch: any;
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  prefixAdd = this.environmentService.configValue.chain_info.bech32Config.bech32PrefixAccAddr;

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private environmentService: EnvironmentService,
    public global: Globals,
  ) {}

  ngOnInit(): void {
    this.TABS = TOKEN_TAB.filter((tab) =>
      (this.tokenDetail?.isNFTContract ? this.tabNFT : this.tabToken).includes(tab.key),
    ).map((tab) => ({
      ...tab,
      value: tab.value,
      key: tab.key === TokenTab.Transfers ? '' : tab.key,
    }));
    this.tabsBackup = this.TABS;

    this.route.queryParams.subscribe((params) => {
      this.paramQuery = params?.a || '';
      this.searchTemp = this.paramQuery;
      this.handleSearch();
    });
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
      let tempTabs;
      this.paramQuery = this.searchTemp;
      if (this.textSearch.length === LENGTH_CHARACTER.TRANSACTION) {
        this.isSearchTx = true;
        tempTabs = this.TABS?.filter((k) => k.key !== TokenTab.Holders && k.key !== TokenTab.Analytics);
      } else if (this.textSearch?.length >= LENGTH_CHARACTER.ADDRESS && this.textSearch?.startsWith(this.prefixAdd)) {
        this.isSearchAddress = true;
        tempTabs = this.TABS?.filter((k) => k.key !== TokenTab.Holders);
        this.getInfoAddress(this.paramQuery);
      }
      this.TABS = tempTabs || this.tabsBackup;
      this.route.queryParams.subscribe((params) => {
        if (!params?.a) {
          window.location.href = `/tokens/token/${this.contractAddress}?a=${this.paramQuery}`;
        }
      });
    } else {
      this.textSearch = '';
    }
  }

  getLength(result: string) {
    this.resultSearch = Number(result) || 0;
  }

  resetSearch() {
    this.searchTemp = '';
    if (this.paramQuery) {
      const params = { ...this.route.snapshot.params };
      window.location.href = `/tokens/token/${params.contractAddress}`;
    }
  }

  getInfoAddress(address: string) {
    this.accountService.getAccountDetail(address).subscribe((res) => {
      this.infoSearch = res.data;
    });
  }
}
