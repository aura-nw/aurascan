import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import BigNumber from 'bignumber.js';
import { Subject, takeUntil } from 'rxjs';
import { LENGTH_CHARACTER, STORAGE_KEYS } from 'src/app/core/constants/common.constant';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { ETokenCoinType, MAX_LENGTH_SEARCH_TOKEN, TOKEN_TAB } from 'src/app/core/constants/token.constant';
import { EModeToken, TokenTab } from 'src/app/core/constants/token.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { TokenService } from 'src/app/core/services/token.service';
import { transferAddress } from 'src/app/core/utils/common/address-converter';
import local from 'src/app/core/utils/storage/local';
import { FeatureFlagService } from '../../../core/data-services/feature-flag.service';
import { FeatureFlags } from '../../../core/constants/feature-flags.enum';

@Component({
  selector: 'app-token-content',
  templateUrl: './token-content.component.html',
  styleUrls: ['./token-content.component.scss'],
})
export class TokenContentComponent implements OnInit {
  @Input() tokenDetail: any;
  @Input() contractAddress: string;
  @Input() channelPath: any;
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

  activeTabID = 0;
  textPlaceHolder = 'Filter Address/Name Tag/Txn Hash';
  linkAddress: string;
  EModeToken = EModeToken;
  destroyed$ = new Subject<void>();

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
    private router: Router,
    private featureFlag: FeatureFlagService,
  ) {}

  ngOnInit(): void {
    if (this.featureFlag.isEnabled(FeatureFlags.SetTokenInfo)) {
      this.tabStaking = [TokenTab.Holders];
      this.tabIBC = [TokenTab.Transfers, TokenTab.Holders];
      this.tabToken = [TokenTab.Transfers, TokenTab.Holders, TokenTab.Contract];
    }

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

      if (this.featureFlag.isEnabled(FeatureFlags.SetTokenInfo)) {
        if (!this.paramQuery) {
          this.TABS.push({
            key: TokenTab.Info,
            value: 'Info',
          });
          this.tabsBackup = this.TABS;
        }
      }
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
    const queryParams = this.route.snapshot?.queryParams?.a;
    this.searchTemp = this.searchTemp?.trim();
    this.isSearchTx = false;
    this.TABS = this.tabsBackup;
    if (this.searchTemp?.length > 0) {
      const addressNameTag = this.nameTagService.findAddressByNameTag(this.searchTemp);
      this.textSearch = this.searchTemp;
      let tempTabs;
      const { accountAddress } = transferAddress(
        this.chainInfo.bech32Config.bech32PrefixAccAddr,
        addressNameTag || this.searchTemp,
      );
      this.paramQuery = accountAddress || addressNameTag || this.searchTemp;

      if (!queryParams && this.paramQuery?.length > 0) {
        this.redirectPage(`/token/${this.linkAddress}`, {
          a: this.paramQuery,
        });
      }

      // check if mode not equal native coin
      if (this.tokenDetail.modeToken !== EModeToken?.Native) {
        if (
          this.textSearch.length === LENGTH_CHARACTER.TRANSACTION &&
          this.textSearch == this.textSearch.toUpperCase()
        ) {
          this.isSearchTx = true;
          tempTabs = this.TABS?.filter((k) => k.key !== TokenTab.Holders && k.key !== TokenTab.Analytics);
        } else if (
          this.paramQuery?.length >= LENGTH_CHARACTER.ADDRESS &&
          (this.paramQuery?.startsWith(this.prefixAdd) || this.tokenDetail.modeToken === EModeToken?.IBCCoin)
        ) {
          this.isSearchAddress = true;
          tempTabs = this.TABS?.filter((k) => k.key !== TokenTab.Holders);
          this.getInfoAddress(this.paramQuery);
        } else {
          tempTabs = this.TABS?.filter((k) => k.key !== TokenTab.Holders);
        }
      } else if (this.paramQuery?.length >= LENGTH_CHARACTER.ADDRESS && this.paramQuery?.startsWith(this.prefixAdd)) {
        this.isSearchAddress = true;
        this.tokenService.filterBalanceNative$.pipe(takeUntil(this.destroyed$)).subscribe((res) => {
          this.infoSearch['balance'] = res || 0;
          this.setFilterValue(this.infoSearch['balance']);
        });
      }
      this.TABS = tempTabs || this.tabsBackup;
    } else {
      this.textSearch = '';
    }
  }

  redirectPage(urlLink: string, queryParams?: any) {
    this.router.navigate([urlLink], { queryParams });
  }

  resetSearch() {
    this.searchTemp = '';
    if (this.paramQuery) {
      const params = { ...this.route.snapshot.params };
      this.redirectPage(`/token/${params.contractAddress}`);
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
