import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import BigNumber from 'bignumber.js';
import { LENGTH_CHARACTER, STORAGE_KEYS } from 'src/app/core/constants/common.constant';
import { ContractVerifyType, EvmContractRegisterType } from 'src/app/core/constants/contract.enum';
import { ETokenCoinType, MAX_LENGTH_SEARCH_TOKEN, TOKEN_TAB } from 'src/app/core/constants/token.constant';
import { EModeToken, TokenTab } from 'src/app/core/constants/token.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { TokenService } from 'src/app/core/services/token.service';
import local from 'src/app/core/utils/storage/local';

@Component({
  selector: 'app-evm-token-content',
  templateUrl: './evm-token-content.component.html',
  styleUrls: ['./evm-token-content.component.scss'],
})
export class EvmTokenContentComponent implements OnInit {
  @Input() tokenDetail: any;
  @Input() contractAddress: string;
  @Output() hasMore = new EventEmitter<any>();

  tabStaking = [TokenTab.Holders];
  tabIBC = [TokenTab.Transfers, TokenTab.Holders];
  tabToken = [TokenTab.Transfers, TokenTab.Holders, TokenTab.Contract];
  tabNFT = [TokenTab.Transfers, TokenTab.Holders, TokenTab.Inventory, TokenTab.Contract];
  TABS = [];
  paramQuery = '';
  textSearch: string = '';
  searchTemp: string = '';
  isSearchTx = false;
  isSearchAddress = false;
  tokenTab = TokenTab;
  currentTab = this.tokenTab.Transfers;
  tabsBackup: any;
  infoSearch: {
    balance?: string | number;
    value?: string | number;
    valueAura?: string | number;
  } = {};
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  contractVerifyType = ContractVerifyType;
  lengthNormalAddress = LENGTH_CHARACTER.ADDRESS;
  linkToken = 'nft';
  activeTabID = 0;
  textPlaceHolder = 'Filter Address/Name Tag/Txn Hash';
  linkAddress: string;
  EModeToken = EModeToken;

  coinInfo = this.environmentService.chainInfo.currencies[0];
  prefixAdd = this.environmentService.chainInfo.bech32Config.bech32PrefixAccAddr;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  chainInfo = this.environmentService.chainInfo;

  constructor(
    private route: ActivatedRoute,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
    private tokenService: TokenService,
    private nameTagService: NameTagService,
    private contractService: ContractService,
  ) {}

  ngOnInit(): void {
    this.linkAddress = this.route.snapshot.paramMap.get('contractAddress');
    let tabFilter;
    switch (this.tokenDetail.modeToken) {
      case EModeToken.Native:
        tabFilter = this.tabStaking;
        this.currentTab = this.tokenTab.Holders;
        this.textPlaceHolder = 'Filter Address/Name Tag';
        break;
      case EModeToken.IBCCoin:
        tabFilter = this.tabIBC;
        this.textPlaceHolder = 'Filter Address/Name Tag/Txn hash';
        break;
      default:
        tabFilter = this.tabToken;
        if (this.tokenDetail?.isNFTContract) {
          tabFilter = this.tabNFT;
          this.textPlaceHolder = 'Filter Address/Name Tag/Txn Hash/Token ID';
        }
        break;
    }

    this.TABS = TOKEN_TAB.filter((tab) => tabFilter.includes(tab.key)).map((tab) => ({
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
      // check if mode not equal native coin
      if (this.tokenDetail.modeToken !== EModeToken?.Native) {
        if (
          this.textSearch.length === LENGTH_CHARACTER.TRANSACTION &&
          this.textSearch == this.textSearch.toUpperCase()
        ) {
          this.isSearchTx = true;
          tempTabs = this.TABS?.filter((k) => k.key !== TokenTab.Holders && k.key !== TokenTab.Analytics);
        } else if (this.textSearch?.length >= LENGTH_CHARACTER.ADDRESS && this.textSearch?.startsWith(this.prefixAdd)) {
          this.isSearchAddress = true;
          tempTabs = this.TABS?.filter((k) => k.key !== TokenTab.Holders);
          this.getInfoAddress(this.paramQuery);
        } else {
          tempTabs = this.TABS?.filter((k) => k.key !== TokenTab.Holders);
        }
      } else if (this.textSearch?.length >= LENGTH_CHARACTER.ADDRESS && this.textSearch?.startsWith(this.prefixAdd)) {
        this.isSearchAddress = true;
        this.tokenService.filterBalanceNative$.subscribe((res) => {
          this.infoSearch['balance'] = res || 0;
          this.setFilterValue(this.infoSearch['balance']);
        });
      }
      this.TABS = tempTabs || this.tabsBackup;
      this.route.queryParams.subscribe((params) => {
        if (!params?.a) {
          window.location.href = `/token/${this.linkAddress}?a=${encodeURIComponent(this.paramQuery)}`;
        }
      });
    } else {
      this.textSearch = '';
    }
  }

  resetSearch() {
    this.searchTemp = '';
    if (this.paramQuery) {
      const params = { ...this.route.snapshot.params };
      window.location.href = `/token/${params.contractAddress}`;
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
      } else if (this.contractAddress && this.tokenDetail.modeToken !== ETokenCoinType.IBC) {
        const data = await client.queryContractSmart(this.contractAddress, queryData);
        this.infoSearch['balance'] = data?.balance;
        this.infoSearch['value'] = new BigNumber(data?.balance)
          .multipliedBy(this.tokenDetail.price)
          .dividedBy(Math.pow(10, this.tokenDetail.decimals))
          .toFixed();
        this.infoSearch['valueAura'] = new BigNumber(data?.balance)
          .multipliedBy(this.tokenDetail.price)
          .dividedBy(Math.pow(10, this.tokenDetail.decimals))
          .dividedBy(this.tokenService.nativePrice)
          .toFixed();
      } else {
        const tempBalance = await this.contractService.getContractBalance(address).catch((error) => null);
        if (tempBalance?.data?.balances?.length > 0) {
          this.infoSearch['balance'] =
            tempBalance?.data?.balances?.find((k) => k.denom === this.tokenDetail?.denomHash)?.amount || 0;
          this.setFilterValue(this.infoSearch['balance']);
        } else {
          this.infoSearch.balance = 0;
          this.infoSearch.value = 0;
          this.infoSearch.valueAura = 0;
        }
      }
    } catch (error) {
      this.infoSearch['balance'] = 0;
    }
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

  setFilterValue(balance: string | number) {
    this.infoSearch['value'] = new BigNumber(balance || 0)
      .multipliedBy(this.tokenDetail.price || 0)
      .dividedBy(Math.pow(10, this.tokenDetail.decimals))
      .toFixed();
    this.infoSearch['valueAura'] = new BigNumber(balance || 0)
      .multipliedBy(this.tokenDetail.price || 0)
      .dividedBy(Math.pow(10, this.tokenDetail.decimals))
      .dividedBy(this.tokenService.nativePrice)
      .toFixed();
  }
}
