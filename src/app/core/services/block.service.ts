import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnvironmentService } from '../data-services/environment.service';
import { checkEnvQuery } from '../utils/common/info-common';
import { CommonService } from './common.service';

@Injectable()
export class BlockService extends CommonService {
  apiUrl = `${this.environmentService.configValue.beUri}`;
  chainInfo = this.environmentService.configValue.chain_info;
  graphUrl = `${this.environmentService.configValue.graphUrl}`;
  envDB = checkEnvQuery(this.environmentService.configValue.env);

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getBlockAndTxs(type: string): Observable<any> {
    const date = new Date();
    return this.http.get<any>(`${this.apiUrl}/metrics/transactions?range=${type}&timezone=${date.getTimezoneOffset()}`);
  }

  getDataBlock(payload) {
    const envDB = checkEnvQuery(this.environmentService.configValue.env);
    const operationsDoc = `
    query auratestnet_block($limit: Int = 100, $order: order_by = desc, $height: Int = null, $hash: String = null, $path: String = null, $operatorAddress: String = null, $heightGT: Int = null, $heightLT: Int = null) {
      ${envDB} {
        block(limit: $limit, order_by: {height: $order}, where: {height: {_eq: $height, _gt: $heightGT, _lt: $heightLT}, hash: {_eq: $hash}, validator: {operator_address: {_eq: $operatorAddress}}}) {
          data(path: $path)
          validator {
            operator_address
            description
          }
          hash
          height
          time
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload.limit,
          order: 'desc',
          hash: null,
          height: payload.height,
          path: 'block',
          operatorAddress: payload.address,
          heightGT: null,
          heightLT: payload.nextHeight,
        },
        operationName: 'auratestnet_block',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}
