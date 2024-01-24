import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChainInfo } from '@keplr-wallet/types';
import * as _ from 'lodash';
import { BehaviorSubject, Subject, lastValueFrom, takeUntil } from 'rxjs';
import { TYPE_TRANSACTION } from '../constants/transaction.constant';
import { TRANSACTION_TYPE_ENUM, TypeTransaction } from '../constants/transaction.enum';
import { LCD_COSMOS } from '../constants/url.constant';
import { ELeapMode } from '../constants/wallet.constant';

export interface IConfiguration {
  environment: {
    name: string;
    label: {
      desktop: string;
      mobile: string;
    };
    logo: string;
    notice: {
      content: string;
      url: string;
    };
    nativeName: string;
  };
  chainConfig: {
    stakingTime: string;
    blockTime: number;
    quotaSetPrivateName: number;
    quotaSetWatchList: number;
    quotaNotification: number;
    coins: {
      name: string;
      display: string;
      denom: string;
      decimal: number;
      logo: string;
    }[];
    features: string[];
    chain_info: ChainInfo & { gasPriceStep: any };
    cosmos_sdk_version?: string;
  };
  image: {
    validator: string;
    assets: string;
  };
  api: {
    backend: string;
    socket: string;
    ipfsDomain: string;
    googleClientId: string;
    coingecko: {
      url: string;
      ids: string[];
    };
    google: {
      url: string;
      clientId: string;
      siteKeyCaptcha: string;
    };
    horoscope: {
      url: string;
      graphql: string;
      rest: string;
      chain: string;
    };
  };
}

@Injectable()
export class EnvironmentService {
  configUri = './assets/config/config.json';
  isMobile = false;
  isNativeApp = false;
  bondedTokensPoolAddress = null;
  config: BehaviorSubject<IConfiguration> = new BehaviorSubject(null);

  get configValue(): IConfiguration {
    return this.config?.value;
  }

  get environment() {
    return _.get(this.configValue, 'environment');
  }

  get chainName() {
    return this.environment.nativeName || _.startCase(_.camelCase(this.chainInfo?.bech32Config?.bech32PrefixAccAddr));
  }

  get chainConfig() {
    return _.get(this.configValue, 'chainConfig');
  }

  get chainInfo() {
    return _.get(this.configValue, 'chainConfig.chain_info');
  }

  get chainId() {
    return _.get(this.configValue, 'chainConfig.chain_info.chainId');
  }

  get coinDecimals() {
    return _.get(this.configValue, 'chainConfig.chain_info.currencies[0].coinDecimals');
  }

  get stakingTime() {
    return _.get(this.configValue, 'chainConfig.stakingTime');
  }

  get coins() {
    return _.get(this.configValue, 'chainConfig.coins');
  }

  get imageUrl() {
    return _.get(this.configValue, 'image.assets');
  }

  get ipfsDomain() {
    return _.get(this.configValue, 'api.ipfsDomain');
  }

  get backend() {
    return _.get(this.configValue, 'api.backend');
  }

  get horoscope() {
    return _.get(this.configValue, 'api.horoscope');
  }

  get graphql() {
    const { graphql, url } = _.get(this.configValue, 'api.horoscope');
    return url + graphql;
  }

  get socketUrl() {
    return _.get(this.configValue, 'api.socket');
  }

  get googleClientId() {
    const _google = _.get(this.configValue, 'api.google');
    return `${_google.clientId}.${_google.url}`;
  }

  get siteKeyCaptcha() {
    return _.get(this.configValue, 'api.google.siteKeyCaptcha');
  }

  get coingecko() {
    return _.get(this.configValue, 'api.coingecko');
  }

  destroyed$ = new Subject<void>();
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(takeUntil(this.destroyed$));
  constructor(
    private http: HttpClient,
    private layout: BreakpointObserver,
  ) {
    this.breakpoint$.subscribe((state) => {
      this.isMobile = state?.matches ? true : false;
    });

    this.checkNativeApp();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  loadConfig() {
    return lastValueFrom(this.http.get<IConfiguration>(this.configUri))
      .then((config: any) => {
        const configuration: IConfiguration = config as IConfiguration;

        if (this.config) {
          this.config.next(configuration);
          return;
        }

        this.config = new BehaviorSubject(configuration);
      })
      .catch((err: any) => {
        console.error(err);
      });
  }

  async load(): Promise<void> {
    await this.loadConfig();
    await this.extendsTxType();

    this.getNodeInfo();
    this.getBondedAddress();
  }

  extendsTxType(): Promise<void> {
    return lastValueFrom(this.http.get('./assets/config/tx_type_config.json')).then((typeConfigs) => {
      (typeConfigs as any[]).forEach((data) => {
        TRANSACTION_TYPE_ENUM[data.label] = data.label;
        TypeTransaction[data.value] = data.value;
        TYPE_TRANSACTION.push({ label: TRANSACTION_TYPE_ENUM[data.label], value: TypeTransaction[data.value] });
      });
    });
  }

  getNodeInfo(): void {
    this.http.get(`${this.chainInfo.rest}/cosmos/base/tendermint/v1beta1/node_info`).subscribe((data: any) => {
      const cosmos_sdk_version = data?.application_version?.cosmos_sdk_version;
      if (cosmos_sdk_version) {
        const configuration: IConfiguration = this.configValue;
        configuration.chainConfig.cosmos_sdk_version = cosmos_sdk_version;

        this.config.next(configuration);
      }
    });
  }

  checkNativeApp() {
    if ((window.coin98 || window.leap) && this.isMobile) {
      try {
        if (window.coin98?.keplr || window.leap?.mode == ELeapMode.MobileWeb) {
          this.isNativeApp = true;
        }
      } catch {}
    }
  }

  getBondedAddress() {
    this.http.get(`${this.chainInfo.rest}/${LCD_COSMOS.MODULE_ACCOUNTS}/bonded_tokens_pool`).subscribe((res: any) => {
      this.bondedTokensPoolAddress = _.get(res, 'account.base_account.address');
    });
  }
}
