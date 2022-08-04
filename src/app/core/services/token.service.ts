import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { INDEXER_URL } from '../constants/common.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class TokenService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;
  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getListToken(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cw20-tokens`, payload);
  }

  getListCW721Token(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cw721-tokens`, payload);
  }

  getTokenCW20Detail(address): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cw20-tokens/${address}`);
  }

  getTokenCW721Detail(address): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cw721-tokens/${address}`);
  }

  getListTokenTransfer(
    limit: string | number,
    offset: string | number,
    contractAddress: string,
    filterData = '',
  ): Observable<any> {
    let url = `${INDEXER_URL}/transaction?chainid=${this.chainInfo.chainId}&searchValue=${contractAddress}&pageOffset=${offset}&pageLimit=${limit}&countTotal=true&reverse=false`;
    if (filterData) {
      if (filterData.length > 60) {
        url += `&txHash=${filterData}`;
      } else {
        url += `&address=${filterData}`;
      }
    }
    return this.http.get<any>(url);
  }

  getListTokenNFT(contractAddress: string, payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cw721-tokens/${contractAddress}/nfts`, payload);
  }

  getListTokenHolder(token: string): Observable<any> {
    this.setURL();
    // return this.http.get<any>(`${this.apiUrl}/proposals`);
    return this.http.get('../../assets/mock-data/token-list-transfer.json');
  }

  getContractDetail(tokenAddress): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/contracts/${tokenAddress}`);
  }
}
