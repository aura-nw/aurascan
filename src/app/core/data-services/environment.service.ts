import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChainsInfo } from 'src/app/core/constants/wallet.constant';
export interface IApiUrl {
  fabric: string;
  cosmos: string;
  chainId: string;
  timeStaking: string;
  urlSocket: string;
  validator_s3: string;
  chain_info: any;
}
@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  public apiUrl: BehaviorSubject<IApiUrl>;

  constructor(private http: HttpClient) {
    this.apiUrl = new BehaviorSubject<IApiUrl>({
      fabric: '',
      cosmos: '',
      chainId: '',
      timeStaking: '',
      urlSocket: '',
      validator_s3: '',
      chain_info: {},
    });
  }

  load(): Promise<unknown> {
    return this.http
      .get('./assets/config/config.json')
      .toPromise()
      .then((config: any) => {
        const chainId = config['chainId'] || 'serenity-testnet-001';
        const chain_info = config['chain_info']?.chainId ? config['chain_info'] : ChainsInfo?.chainId;

        const data = {
          fabric: config['fabric'],
          cosmos: config['cosmos'],
          chainId,
          timeStaking: config['timeStaking'] || '1814400',
          urlSocket: config['urlSocket'],
          validator_s3: config['validator_s3'],
          chain_info,
        };

        this.apiUrl.next(data);
      })
      .catch((err: any) => {
        console.error(err);
      });
  }
}
