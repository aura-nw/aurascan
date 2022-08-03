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

  getTokenDetail(address): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/cw20-tokens/aura1kg6luzakllku0d86dlk8dylrfs8xlf5a9csac6hyq8tnhh3xsyxqgmhnct`,
    );
  }

  getListTokenTransfer(token: string): Observable<any> {
    this.setURL();
    // return this.http.get<any>(`${this.apiUrl}/proposals`);
    return this.http.get('../../assets/mock-data/token-list-transfer.json');
  }

  getListTokenTransferTemp(limit: string | number, offset: string | number, contractAddress: string, filterData = ''): Observable<any> {
    return this.http.get<any>(
      `${INDEXER_URL}/transaction?chainid=${this.chainInfo.chainId}&searchValue=${contractAddress}&pageOffset=${offset}&pageLimit=${limit}&countTotal=true&reverse=false&address=${filterData}`,
    );
  }

  getListTokenNFT(token: string): Observable<any> {
    this.setURL();
    // return this.http.get<any>(`${this.apiUrl}/proposals`);
    return this.http.get('../../assets/mock-data/token-list-nft.json');
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
