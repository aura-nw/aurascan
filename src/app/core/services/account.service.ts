import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';
import { IResponsesTemplates } from '../models/common.model';
import { IWalletDetail } from '../models/wallet';
import { CommonService } from './common.service';

@Injectable()
export class AccountService extends CommonService {
  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getAccountDetail(account_id: string | number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/account/${account_id}`);
  }

  getWalletDetail(address: string): Observable<IResponsesTemplates<IWalletDetail>> {
    if (!address) {
      return of(null);
    }
    return this.http.get<any>(`${this.apiUrl}/wallets/${address}`);
  }
}
