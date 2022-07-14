import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChainInfo } from '@keplr-wallet/types';
import { BehaviorSubject } from 'rxjs';
import { ChainsInfo } from 'src/app/core/constants/wallet.constant';

interface ChainInfoEx  extends ChainInfo {
  logo?: string, 
  explorer?: string
}

export interface IConfiguration {
  fabric: string;
  beUri: string;
  chainId: string;
  timeStaking: string;
  urlSocket: string;
  validator_s3: string;
  chain_info: ChainInfoEx;
}

@Injectable()
export class EnvironmentService {
  private config: BehaviorSubject<IConfiguration> = new BehaviorSubject({
    fabric: '',
    beUri: '',
    chainId: '',
    timeStaking: '',
    urlSocket: '',
    validator_s3: '',
    chain_info: null,
  });

  get configValue(): IConfiguration {
    return this.config.value;
  }

  // config$ = this.config.asObservable();

  constructor(private http: HttpClient) {
    // this.config = new BehaviorSubject<IConfiguration>({
    //   fabric: '',
    //   beUri: '',
    //   chainId: '',
    //   timeStaking: '',
    //   urlSocket: '',
    //   validator_s3: '',
    //   chain_info: {},
    // });

    // this.config$.subscribe(console.log)
  }

  async load(): Promise<void> {
    return this.http
      .get('./assets/config/config.json')
      .toPromise()
      .then((config: any) => {
        const chainId = config['chainId'] || 'serenity-testnet-001';
        const chain_info = config['chain_info']?.chainId ? config['chain_info'] : ChainsInfo?.chainId;

        const data: IConfiguration = {
          fabric: config['fabric'],
          beUri: config['cosmos'],
          chainId,
          timeStaking: config['timeStaking'] || '1814400',
          urlSocket: config['urlSocket'],
          validator_s3: config['validator_s3'],
          chain_info,
        };

        this.config.next(data);
      })
      .catch((err: any) => {
        console.error(err);
      });
  }
}
