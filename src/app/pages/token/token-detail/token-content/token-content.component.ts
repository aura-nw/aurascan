import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { LENGTH_CHARACTER, STORAGE_KEYS } from 'src/app/core/constants/common.constant';
import { ContractRegisterType, ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { TokenService } from 'src/app/core/services/token.service';
import { MAX_LENGTH_SEARCH_TOKEN, TOKEN_TAB } from '../../../../core/constants/token.constant';
import { TokenTab } from '../../../../core/constants/token.enum';
import local from 'src/app/core/utils/storage/local';
import { Globals } from 'src/app/global/global';
import BigNumber from 'bignumber.js';

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

  tabToken = [TokenTab.Transfers, TokenTab.Holders, TokenTab.Contract];
  tabNFT = [TokenTab.Transfers, TokenTab.Holders, TokenTab.Inventory, TokenTab.Contract];
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
  textPlaceHolder = 'Filter Address/Name Tag/Txn Hash';

  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  prefixAdd = this.environmentService.chainInfo.bech32Config.bech32PrefixAccAddr;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  chainInfo = this.environmentService.chainInfo;
  auraPrice = this.global.price.aura;

  constructor(
    private route: ActivatedRoute,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
    private tokenService: TokenService,
    private nameTagService: NameTagService,
    private global: Globals,
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
      this.searchTemp = this.nameTagService.findNameTagByAddress(this.searchTemp);
    });

    if (local.getItem(STORAGE_KEYS.IS_VERIFY_TAB) == 'true') {
      this.currentTab = this.tokenTab.Contract;
      this.activeTabID = this.TABS.findIndex((k) => k.key === this.tokenTab.Contract);
      local.removeItem(STORAGE_KEYS.IS_VERIFY_TAB);
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
      const addressNameTag = this.nameTagService.findAddressByNameTag(this.searchTemp);
      this.textSearch = this.searchTemp;
      let tempTabs;
      this.paramQuery = addressNameTag || this.searchTemp;
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
      if (this.tokenDetail.isNFTContract) {
        this.countBalanceNFT(address);
      } else {
        const data = await client.queryContractSmart(this.contractAddress, queryData);
        this.infoSearch['balance'] = data?.balance;
        this.infoSearch['value'] = new BigNumber(data?.balance)
          .multipliedBy(this.tokenDetail.price)
          .dividedBy(Math.pow(10, this.tokenDetail.decimals))
          .toFixed();
        this.infoSearch['valueAura'] = new BigNumber(data?.balance)
          .multipliedBy(this.tokenDetail.price)
          .dividedBy(Math.pow(10, this.tokenDetail.decimals))
          .dividedBy(this.auraPrice)
          .toFixed();
      }
    } catch (error) {}
  }

  getMoreTx(event) {
    this.hasMore.emit(event);
  }

  countBalanceNFT(address) {
    let payload = {
      limit: 20,
      offset: 0,
      contractAddress: this.contractAddress,
      owner: address,
      token_id: null,
    };

    this.tokenService.getListTokenNFTFromIndexer(payload).subscribe((res) => {
      this.infoSearch['balance'] = res.cw721_token_aggregate?.aggregate?.count || 0;
    });
  }
}
