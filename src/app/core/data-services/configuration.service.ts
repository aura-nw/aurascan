import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChainInfo } from '@keplr-wallet/types';
import { BehaviorSubject, lastValueFrom } from 'rxjs';

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
  };
  chainConfig: {
    stakingTime: string;
    blockTime: number;
    quotaSetPrivateName: number;
    coins: {
      name: string;
      display: string;
      denom: string;
      decimal: number;
      logo: string;
    }[];
    features: string[];
    chain_info: ChainInfo;
  };
  image: {
    validator: string;
    assets: string;
  };
  api: {
    be: string;
    socket: string;
    ipfsDomain: string;
    googleClientId: string;
    google: {
      url: string;
      clientId: string;
    };
    horoscope: {
      url: string;
      graphql: string;
      rest: string;
      chain: string;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  configUri = './assets/config/config.nois.json';
  private config: BehaviorSubject<IConfiguration>;

  get configValue(): IConfiguration {
    return this.config.value;
  }

  constructor(private http: HttpClient) {}

  loadConfig() {
    return this.http.get<IConfiguration>(this.configUri);
  }

  async load(): Promise<void> {
    return lastValueFrom(this.loadConfig())
      .then((config: any) => {
        const configuration: IConfiguration = config as IConfiguration;
        console.log(config);
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
}
