import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class BlockService extends CommonService {
  apiUrl = `${this.environmentService.configValue.beUri}`;
  chainInfo = this.environmentService.configValue.chain_info;
  graphUrl = `${
    this.environmentService.configValue.horoscopeUrl + this.environmentService.configValue.horoscopePathGraphql
  }`;
  envDB = this.environmentService.configValue.horoscopeSelectedChain;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getBlockAndTxs(type: string): Observable<any> {
    const date = new Date();
    return this.http.get<any>(`${this.apiUrl}/metrics/transactions?range=${type}&timezone=${date.getTimezoneOffset()}`);
  }

  getDataBlock(payload) {
    const operationsDoc = `
    query auratestnet_block($limit: Int = 100, $order: order_by = desc, $height: Int = null, $hash: String = null, $operatorAddress: String = null, $heightGT: Int = null, $heightLT: Int = null) {
      ${this.envDB} {
        block(limit: $limit, order_by: {height: $order}, where: {height: {_eq: $height, _gt: $heightGT, _lt: $heightLT}, hash: {_eq: $hash}, validator: {operator_address: {_eq: $operatorAddress}}}) {
          data
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
          operatorAddress: payload.address,
          heightGT: null,
          heightLT: payload.nextHeight,
        },
        operationName: 'auratestnet_block',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}
