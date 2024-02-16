import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class BlockService extends CommonService {
  apiUrl = `${this.environmentService.backend}`;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getBlockAndTxs(type: string): Observable<any> {
    const date = new Date();
    return this.http.get<any>(`${this.apiUrl}/metrics/transactions?range=${type}&timezone=${date.getTimezoneOffset()}`);
  }

  getDataBlock(payload) {
    const getValidator = !payload.getValidator
      ? `validator {
            operator_address 
            description 
          }`
      : '';
    const operationsDoc = `
    query queryBlock($limit: Int = 100, $order: order_by = desc, $height: Int = null, $hash: String = null, $operatorAddress: String = null, $heightGT: Int = null, $heightLT: Int = null) {
      ${this.envDB} {
        block(limit: $limit, order_by: {height: $order}, where: {height: {_eq: $height, _gt: $heightGT, _lt: $heightLT}, hash: {_eq: $hash}, validator: {operator_address: {_eq: $operatorAddress}}}) {
          txs: data(path: "block.data.txs")
          ${getValidator}
          hash
          height
          time
          tx_count
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
        operationName: 'queryBlock',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getDataBlockWithOperator(payload) {
    const operationsDoc = `
    query queryBlock($limit: Int = 100, $order: order_by = desc, $height: Int = null, $consensus_hex_address: String = null, $heightGT: Int = null, $heightLT: Int = null) {
      ${this.envDB} {
        block(limit: $limit, order_by: {height: $order}, where: {height: {_eq: $height, _gt: $heightGT, _lt: $heightLT}, 
          proposer_address: {_eq: $consensus_hex_address}}) {
          txs: data(path: "block.data.txs")
          hash
          height
          time
          tx_count
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
          height: payload.height,
          consensus_hex_address: payload.consensus_hex_address,
          heightGT: null,
          heightLT: payload.nextHeight,
        },
        operationName: 'queryBlock',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getDataBlockDetail(payload) {
    const operationsDoc = `
    query queryBlockDetail($limit: Int = 100, $height: Int = null) {
      ${this.envDB} {
        block(limit: $limit, where: {height: {_eq: $height}}) {
          data
          validator {
            operator_address
            description
          }
          hash
          height
          time
          tx_count
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload.limit,
          height: payload.height,
        },
        operationName: 'queryBlockDetail',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getRawData(url): Observable<any> {
    return this.http.get<any>(url);
  }
}
