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
  indexerUrl = `${this.environmentService.configValue.indexerUri}`;
  graphUrl = `${this.environmentService.configValue.graphUrl}`;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
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

  getBlockWithOperator(height) {
    const envDB = checkEnvQuery(this.environmentService.configValue.env);
    const operationsDoc = `
    query getBlockDetail($height: Int) {
      ${envDB} {
        block(where: {validator: {operator_address: {_eq: $address}}}, order_by: {time: desc}, limit: 100) {
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
      .pipe(map((res) => (res?.data ? res?.data[envDB] : null)));
  }

  getListBlock(limit) {
    const envDB = checkEnvQuery(this.environmentService.configValue.env);
    const operationsDoc = `
    query getListBlocks($limit: Int) {
      ${envDB} {
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
      .pipe(map((res) => (res?.data ? res?.data[envDB] : null)));
  }

  getBlockDetail(height) {
    const envDB = checkEnvQuery(this.environmentService.configValue.env);
    const operationsDoc = `
    query getBlockDetail($height: Int) {
      ${envDB} {
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
      .pipe(map((res) => (res?.data ? res?.data[envDB] : null)));
  }
}
