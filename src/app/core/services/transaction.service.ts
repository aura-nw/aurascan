import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';
import axios from 'axios';
import { LCD_COSMOS } from '../constants/url.constant';

@Injectable()
export class TransactionService extends CommonService {
  apiUrl = `${this.environmentService.configValue.beUri}`;
  chainInfo = this.environmentService.configValue.chain_info;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  txs(limit: string | number, offset: string | number): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/transactions?limit=${limit}&offset=${offset}`);
  }

  txsDetail(txhash: string): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/transactions/${txhash}`);
  }

  txsDetailLcd(txhash: string) {
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.TX}/txs/${txhash}`);
  }

  txsWithAddress(limit: string | number, offset: string | number, address: string): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/account/${address}/transaction?limit=${limit}&offset=${offset}`);
  }

  txsWithAddressTemp(limit: string | number, offset: string | number, address: string): Observable<any> {
    return this.http.get<any>(`https://indexer.dev.aurascan.io:/api/v1/transaction?chainid=aura-testnet&address=${address}&pageOffset=${offset}&pageLimit=${limit}&countTotal=true&reverse=true`);
  }
}
