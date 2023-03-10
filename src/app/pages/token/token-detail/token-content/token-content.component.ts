import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { LENGTH_CHARACTER } from 'src/app/core/constants/common.constant';
import { ContractRegisterType, ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
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
  @Output() resultLength = new EventEmitter<any>();
  @Output() hasMore = new EventEmitter<any>();

  tabToken = [TokenTab.Transfers, TokenTab.Holders, TokenTab.Info, TokenTab.Contract];
  tabNFT = [TokenTab.Transfers, TokenTab.Holders, TokenTab.Inventory, TokenTab.Info, TokenTab.Contract];
  TABS = [];
  paramQuery = '';
  textSearch: string = '';
  searchTemp: string = '';
  isSearchTx = false;
  isSearchAddress = false;
  resultSearch = 0;
  tokenTab = TokenTab;
  currentTab = this.tokenTab.Transfers;
  tabsBackup: any;
  infoSearch = {};
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  contractVerifyType = ContractVerifyType;
  lengthNormalAddress = LENGTH_CHARACTER.ADDRESS;
  linkToken = 'token-nft';
  activeTabID = 0;
  textPlaceHolder = 'Filter Address/ TX Hash';

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  prefixAdd = this.environmentService.configValue.chain_info.bech32Config.bech32PrefixAccAddr;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  chainInfo = this.environmentService.configValue.chain_info;

  constructor(
    private route: ActivatedRoute,
    private environmentService: EnvironmentService,
    public global: Globals,
    private layout: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    this.TABS = TOKEN_TAB.filter((tab) =>
      (this.tokenDetail?.isNFTContract ? this.tabNFT : this.tabToken).includes(tab.key),
    ).map((tab) => ({
      ...tab,
      value: tab.value,
      key: tab.key,
    }));
    this.tabsBackup = this.TABS;

    this.route.queryParams.subscribe((params) => {
      this.paramQuery = params?.a || '';
      this.searchTemp = this.paramQuery;
      this.handleSearch();
    });

    if (localStorage.getItem('isVerifyTab') == 'true') {
      this.currentTab = this.tokenTab.Contract;
      this.activeTabID = this.TABS.findIndex((k) => k.key === this.tokenTab.Contract);
      localStorage.setItem('isVerifyTab', null);
    }
  }

  changeTab(tabId): void {
    this.currentTab = tabId;
  }

  handleSearch() {
    this.searchTemp = this.searchTemp?.trim();
    this.isSearchTx = false;
    this.TABS = this.tabsBackup;

    if (this.searchTemp?.length > 0) {
      this.textSearch = this.searchTemp;
      let tempTabs;
      this.paramQuery = this.searchTemp;
      if (this.textSearch.length === LENGTH_CHARACTER.TRANSACTION && this.textSearch == this.textSearch.toUpperCase()) {
        this.isSearchTx = true;
        tempTabs = this.TABS?.filter((k) => k.key !== TokenTab.Holders && k.key !== TokenTab.Analytics);
      } else if (this.textSearch?.length >= LENGTH_CHARACTER.ADDRESS && this.textSearch?.startsWith(this.prefixAdd)) {
        this.isSearchAddress = true;
        tempTabs = this.TABS?.filter((k) => k.key !== TokenTab.Holders);
        this.getInfoAddress(this.paramQuery);
      } else {
        tempTabs = this.TABS?.filter((k) => k.key !== TokenTab.Holders);
      }
      this.TABS = tempTabs || this.tabsBackup;
      this.route.queryParams.subscribe((params) => {
        if (!params?.a) {
          if (this.tokenDetail.type !== ContractRegisterType.CW20) {
            this.linkToken = this.tokenDetail.type === ContractRegisterType.CW721 ? 'token-nft' : 'token-abt';
            window.location.href = `/tokens/${this.linkToken}/${this.contractAddress}?a=${encodeURIComponent(
              this.paramQuery,
            )}`;
          } else {
            window.location.href = `/tokens/token/${this.contractAddress}?a=${encodeURIComponent(this.paramQuery)}`;
          }
        }
      });
    } else {
      this.textSearch = '';
    }
  }

  getLength(result: string) {
    this.resultSearch = Number(result) || 0;
    this.resultLength.emit(this.resultSearch);
  }

  resetSearch() {
    this.searchTemp = '';
    if (this.paramQuery) {
      const params = { ...this.route.snapshot.params };
      if (this.tokenDetail.type !== ContractRegisterType.CW20) {
        this.linkToken = this.tokenDetail.type === ContractRegisterType.CW721 ? 'token-nft' : 'token-abt';
        window.location.href = `/tokens/${this.linkToken}/${params.contractAddress}`;
      } else {
        window.location.href = `/tokens/token/${params.contractAddress}`;
      }
    }
  }

  async getInfoAddress(address: string) {
    let queryData = {};
    if (this.tokenDetail.isNFTContract) {
      queryData = {
        tokens: { limit: 1000, owner: address },
      };
    } else {
      queryData = {
        balance: { address: address },
      };
    }
    const client = await SigningCosmWasmClient.connect(this.chainInfo.rpc);
    try {
      const data = await client.queryContractSmart(this.contractAddress, queryData);
      this.infoSearch['balance'] = this.tokenDetail.isNFTContract ? data?.tokens?.length : data?.balance;
      this.infoSearch['balance'] = this.infoSearch['balance'] || 0;
    } catch (error) {}
  }

  getMoreTx(event) {
    this.hasMore.emit(event);
  }
}
