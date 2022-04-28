import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class TransactionService extends CommonService {
  apiUrl = `${this.environmentService.apiUrl.value.cosmos}`;

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

  getTxsPer(type: string): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/metrics/transactions?range=${type}`);
  }

  txsWithAddress(limit: string | number, offset: string | number, address: string): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/account/${address}/transaction?limit=${limit}&offset=${offset}`);
  }
}
