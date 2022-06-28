import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
export interface IApiUrl {
  fabric: string;
  cosmos: string;
  chainId: string;
  timeStaking: string;
  urlSocket: string;
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
    });
  }

  load(): Promise<unknown> {
    return this.http
      .get('./assets/config/config.json')
      .toPromise()
      .then((config: any) => {
        const data = {
          fabric: config['fabric'],
          cosmos: config['cosmos'],
          chainId: config['chainId'] || 'aura-testnet',
          timeStaking: config['timeStaking'] || '1814400',
          urlSocket: config['urlSocket'],
        };
        this.apiUrl.next(data);
      })
      .catch((err: any) => {
        console.error(err);
      });
  }
}
