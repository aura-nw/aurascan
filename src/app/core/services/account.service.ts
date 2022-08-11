import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { INDEXER_URL } from '../constants/common.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class AccountService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getAccountDetail(account_id: string | number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/account/${account_id}`);
  }

  getAssetByOnwerIndexer(address: string, keyWord: string): Observable<any> {
    return this.http.get<any>(
      `${INDEXER_URL}/asset/getByOwner?chainid=${this.chainInfo.chainId}&owner=${address}&countTotal=true&reverse=false${keyWord}`,
    );
  }

  getAssetCW20ByOnwer(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cw20-tokens/get-by-owner/`,payload);
  }

  getAssetCW721ByOnwer(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cw721-tokens/get-by-owner/`,payload);
  }
}
