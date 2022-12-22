import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class BlockService extends CommonService {
  apiUrl = `${this.environmentService.configValue.beUri}`;
  chainInfo = this.environmentService.configValue.chain_info;
  indexerUrl = `${this.environmentService.configValue.indexerUri}`;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  blocksIndexer(pageLimit: string | number, blockHeight = null): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      pageLimit,
      blockHeight,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${this.indexerUrl}/block`, {
      params,
    });
  }

  blockWithOperator(pageLimit: string | number, operatorAddress: string, nextKey = null): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      pageLimit,
      operatorAddress,
      nextKey,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${this.indexerUrl}/block`, {
      params,
    });
  }

  getBlockAndTxs(type: string): Observable<any> {
    this.setURL();
    const date = new Date();
    return this.http.get<any>(`${this.apiUrl}/metrics/transactions?range=${type}&timezone=${date.getTimezoneOffset()}`);
  }
}
