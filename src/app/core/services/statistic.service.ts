import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class StatisticService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getListAccountStatistic(): Observable<any> {
    return this.http.get<any>(`${this.horoscopeApi}/statistics/top-accounts?chainid=${this.chainId}`);
  }

  getDataStatistic(startDate, endDate): Observable<any> {
    const operationsDoc = `
    query queryStatisticChart($startDate: timestamptz = null, $endDate: timestamptz = null) {
      ${this.envDB} {
        daily_statistics(where: {date: {_gte: $startDate, _lte: $endDate}}, order_by: {date: asc}) {
          daily_active_addresses
          daily_txs
          date
          unique_addresses
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          startDate: startDate,
          endDate: endDate,
        },
        operationName: 'queryStatisticChart',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}
