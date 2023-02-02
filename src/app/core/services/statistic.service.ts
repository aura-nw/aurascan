import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class StatisticService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;
  indexerUrl = `${this.environmentService.configValue.indexerUri}`;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getListAccountStatistic(dayRange, limit): Observable<any> {
    const params = _({
      chainId: this.chainInfo.chainId,
      dayRange : dayRange,
      limit : limit,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();
    return this.http.get<any>(`${this.indexerUrl}/account-statistics`, {
      params,
    });
  }

  getDailyTxStatistic(property: "daily_txs" | "daily_active_addresses" | "unique_addresses", startDate, endDate): Observable<any> {
    const params = _({
      chainId: this.chainInfo.chainId,
      property,
      startDate,
      endDate
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();
    return this.http.get<any>(`${this.indexerUrl}/daily-tx-statistics`, {
      params,
    });
  }
}
