import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { LCD_COSMOS } from '../constants/url.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';
import { checkEnvQuery } from '../utils/common/info-common';
import { map } from 'rxjs/operators';
import { LENGTH_CHARACTER } from '../constants/common.constant';

@Injectable()
export class TransactionService extends CommonService {
  apiUrl = `${this.environmentService.configValue.beUri}`;
  chainInfo = this.environmentService.configValue.chain_info;
  indexerUrl = `${this.environmentService.configValue.indexerUri}`;
  graphUrl = `${this.environmentService.configValue.graphUrl}`;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getListTx(limit: number, offset: string | number, txHash = '') {
    const envDB = checkEnvQuery(this.environmentService.configValue.env);
    let updateQuery = '';
    let path = '(path: "tx")';
    if (txHash?.length > 0 && txHash?.length === LENGTH_CHARACTER.TRANSACTION) {
      updateQuery = 'where: {hash: {_eq: ' + `"${txHash}"` + '}}';
      path = '';
    }
    const operationsDoc = `
    query getListTx($limit: Int) {
      ${envDB} {
        transaction(limit: $limit, order_by: {timestamp: desc}, ${updateQuery}) {
          height
          hash
          timestamp
          code
          gas_used
          gas_wanted
          data${path}
        }
      }
    }
    `;
    console.log(operationsDoc);
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: limit,
        },
        operationName: 'getListTx',
      })
      .pipe(map((res) => (res?.data ? res?.data[envDB] : null)));
  }

  txsIndexer(pageLimit: string | number, offset: string | number, txHash = ''): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      pageLimit,
      offset,
      txHash,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${this.indexerUrl}/transaction`, {
      params,
    });
  }

  txsDetailLcd(txhash: string) {
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.TX}/txs/${txhash}`);
  }

  getAccountTxFromHoroscope(chainId: string, address: string, pageLimit = 10, nextKey = null): Observable<any> {
    const params = _({
      chainid: chainId,
      address,
      pageLimit,
      nextKey,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${this.indexerUrl}/transaction`, {
      params,
    });
  }

  getListIBCSequence(sequence): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      pageLimit: 20,
      sequenceIBC: sequence,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${this.indexerUrl}/transaction`, {
      params,
    });
  }
}
