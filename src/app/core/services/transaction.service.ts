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
  graphUrl = `${this.environmentService.configValue.graphUrl}`;
  envDB = checkEnvQuery(this.environmentService.configValue.env);

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getListTx(limit: number, offset: string | number, txHash = '') {
    let updateQuery = '';
    let path = '(path: "tx")';
    if (txHash?.length > 0 && txHash?.length === LENGTH_CHARACTER.TRANSACTION) {
      updateQuery = ', where: {hash: {_eq: ' + `"${txHash}"` + '}}';
      path = '';
    }
    const operationsDoc = `
    query getListTx($limit: Int) {
      ${this.envDB} {
        transaction(limit: $limit, order_by: {timestamp: desc} ${updateQuery}) {
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
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: limit,
        },
        operationName: 'getListTx',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  // txsIndexer(pageLimit: string | number, offset: string | number, txHash = ''): Observable<any> {
  //   const params = _({
  //     chainid: this.chainInfo.chainId,
  //     pageLimit,
  //     offset,
  //     txHash,
  //   })
  //     .omitBy(_.isNull)
  //     .omitBy(_.isUndefined)
  //     .value();

  //   return this.http.get<any>(`${this.indexerUrl}/transaction`, {
  //     params,
  //   });
  // }

  txsDetailLcd(txhash: string) {
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.TX}/txs/${txhash}`);
  }

  getAccountTxFromHoroscope(address: string, pageLimit = 10, nextKey = null): Observable<any> {
    let filterQuery = '';
    if (nextKey) {
      filterQuery = ', id: {_lt: ' + `${nextKey}` + '}';
    }
    const operationsDoc = `
    query getListTx($limit: Int) {
      ${this.envDB} {
        transaction(limit: $limit, order_by: {timestamp: desc}, where: {event_attribute_index: {value: {_eq: "${address}"}} ${filterQuery} }) {
          id
          height
          hash
          timestamp
          code
          gas_used
          gas_wanted
          data(path: "tx")
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: pageLimit,
        },
        operationName: 'getListTx',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  // getAccountTxFromHoroscope(chainId: string, address: string, pageLimit = 10, nextKey = null): Observable<any> {
  //   const params = _({
  //     chainid: chainId,
  //     address,
  //     pageLimit,
  //     nextKey,
  //   })
  //     .omitBy(_.isNull)
  //     .omitBy(_.isUndefined)
  //     .value();

  //   return this.http.get<any>(`${this.indexerUrl}/transaction`, {
  //     params,
  //   });
  // }

  getListIBCSequence(sequence, channel): Observable<any> {
    const operationsDoc = `
    query getListSequence($limit: Int, $compositeKey: [String!] = "", $value: String = "") {
      ${this.envDB} {
        transaction(limit: $limit, where: {event_attributes: {composite_key: {_in: ["acknowledge_packet.packet_src_channel","send_packet.packet_src_channel", "recv_packet.packet_src_channel"]}, value: {_eq: "${channel}" }}, _and: {event_attributes: {composite_key: {_in: $compositeKey}, value: {_eq: $value}}}}) {
          height
          hash
          timestamp
          code
          gas_used
          gas_wanted
          data
          event_attributes (where: {composite_key: {_eq: "denomination_trace.denom"}}) {
            value
            composite_key
            key
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: 20,
          compositeKey: ["send_packet.packet_sequence", "recv_packet.packet_sequence", "acknowledge_packet.packet_sequence", "timeout_packet.packet_sequence"],
          value: sequence
        },
        operationName: 'getListSequence',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}
