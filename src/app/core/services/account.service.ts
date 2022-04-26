import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';
import { IResponsesTemplates } from '../models/common.model';
import { IWalletDetail } from '../models/wallet';
import { CommonService } from './common.service';

@Injectable()
export class AccountService extends CommonService {
  accountDetail: string = '../../assets/mock-data/account-list.json';
  // listLastedProposal: string = '../../assets/mock-data/proposal-list-lasted.json';
  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService
  ) {
    super(http, environmentService);
  }

  getAccoutDetail(account_id): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/account/${account_id}`);
  }

  getWalletDetail(address: string): Observable<IResponsesTemplates<IWalletDetail>> {
    if (!address) {
      return of(null);
    }
    return this.http.get<any>(`${this.apiUrl}/wallets/${address}`);
  }
}
