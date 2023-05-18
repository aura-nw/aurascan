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

  getBlockWithOperator(payload) {
    const address = payload.address;
    const nextHeight = payload.nextHeight;
    let updateQuery = '';
    if (nextHeight !== null) {
      updateQuery = ', height: {_lt: ' + nextHeight + ', _lte:' + (nextHeight - 100) + '}';
    }
    const operationsDoc = `
    query getBlockWithOperator($address: String) {
      ${this.envDB} {
        block(where: {validator: {operator_address: {_eq: $address}} ${updateQuery}} , order_by: {time: desc}, limit: 100) {
          height
          hash
          time
          data(path: "block")
          validator {
            operator_address
            description
          }
          transactions {
            gas_used
            gas_wanted
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          address: address,
        },
        operationName: 'getBlockWithOperator',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListBlock(limit: number) {
    const operationsDoc = `
    query getListBlocks($limit: Int) {
      ${this.envDB} {
        block(limit: $limit, order_by: {time: desc}) {
          height
          hash
          time
          data(path: "block")
          validator {
            operator_address
            description
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: limit,
        },
        operationName: 'getListBlocks',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getBlockDetail(height: string | number) {
    const operationsDoc = `
    query getBlockDetail($height: Int) {
      ${this.envDB} {
        block(where: {height: {_eq: $height}}) {
          height
          hash
          time
          data(path: "block")
          validator {
            operator_address
            description
          }
          transactions {
            gas_used
            gas_wanted
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          height: height,
        },
        operationName: 'getBlockDetail',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}
