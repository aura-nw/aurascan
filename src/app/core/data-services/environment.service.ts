import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChainInfo } from '@keplr-wallet/types';
import { BehaviorSubject } from 'rxjs';
import type_config from '../../../../tx_type_config.json';
import { TRANSACTION_TYPE_ENUM, TypeTransaction } from '../../../app/core/constants/transaction.enum';
import { TYPE_TRANSACTION } from '../constants/transaction.constant';

export interface IConfiguration {
  fabric: string;
  beUri: string;
  chainId: string;
  timeStaking: string;
  urlSocket: string;
  validator_s3: string;
  image_s3: string;
  chain_info: ChainInfo | null;
  coins: any;
  env: string;
  indexerUri: string;
  timeInterval: number;
  ipfsDomain: string;
  evnLabel: any;
  maxValidator: number;
  horoscopeSelectedChain: string;
  horoscopeUrl: string;
  horoscopePathGraphql: string;
  horoscopePathApi: string;
  notice: { content: string; url: string };
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
    image_s3: '',
    chain_info: null,
    coins: '',
    env: '',
    indexerUri: '',
    timeInterval: null,
    ipfsDomain: '',
    evnLabel: '',
    maxValidator: null,
    horoscopeSelectedChain: '',
    horoscopeUrl: '',
    horoscopePathGraphql: '',
    horoscopePathApi: '',
    notice: { content: '', url: '' },
  });

  get configValue(): IConfiguration {
    return this.config.value;
  }

  constructor(private http: HttpClient) {}

  async load(): Promise<void> {
    return this.http
      .get('./assets/config/config.json')
      .toPromise()
      .then((config: any) => {
        const chainId = config['chainId'] || 'serenity-testnet-001';
        const chain_info = config['chain_info'];

        const data: IConfiguration = {
          fabric: config['fabric'],
          beUri: config['cosmos'],
          chainId,
          timeStaking: config['timeStaking'] || '1814400',
          urlSocket: config['urlSocket'],
          validator_s3: config['validator_s3'],
          image_s3: config['image_s3'] || 'https://aura-explorer-assets.s3.ap-southeast-1.amazonaws.com/dev-assets/',
          chain_info,
          coins: config['coins'],
          env: config['env'],
          indexerUri: config['urlIndexer'],
          timeInterval: config['timeInterval'] || 4000,
          ipfsDomain: config['ipfsDomain'],
          evnLabel: config['evnLabel'],
          maxValidator: config['maxValidator'] || 200,
          horoscopeSelectedChain: config['horoscopeSelectedChain'],
          horoscopeUrl: config['horoscopeUrl'],
          horoscopePathGraphql: config['horoscopePathGraphql'],
          horoscopePathApi: config['horoscopePathApi'],
          notice: config['notice'] || { content: '', url: '' },
        };

        this.config.next(data);
      })
      .catch((err: any) => {
        console.error(err);
      });
  }

  extends_tx_type() {
    try {
      // Extends config type transaction
      type_config.forEach((data) => {
        TRANSACTION_TYPE_ENUM[data.label] = data.label;
        TypeTransaction[data.value] = data.value;
        TYPE_TRANSACTION.push({ label: TRANSACTION_TYPE_ENUM[data.label], value: TypeTransaction[data.value] });
      });
    } catch (err: any) {
      console.error(err);
    }
  }
}
