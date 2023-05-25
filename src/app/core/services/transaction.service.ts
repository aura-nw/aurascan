import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LCD_COSMOS } from '../constants/url.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { checkEnvQuery } from '../utils/common/info-common';
import { CommonService } from './common.service';

@Injectable()
export class TransactionService extends CommonService {
  apiUrl = `${this.environmentService.configValue.beUri}`;
  chainInfo = this.environmentService.configValue.chain_info;
  graphUrl = `${this.environmentService.configValue.graphUrl}`;
  envDB = checkEnvQuery(this.environmentService.configValue.env);

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getListTx(payload) {
    const operationsDoc = `
    query auratestnet_transaction(
      $limit: Int = 100
      $order: order_by = desc
      $compositeKey: String = null
      $value: String = null
      $key: String = null
      $compositeKey2: String = null
      $value2: String = null
      $key2: String = null
      $heightGT: Int = null
      $heightLT: Int = null
      $indexGT: Int = null
      $indexLT: Int = null
      $hash: String = null
      $height: Int = null
    ) {
      auratestnet {
        transaction(
          limit: $limit
          where: {
            hash: { _eq: $hash }
            height: { _eq: $height }
            event_attribute_index: {
              value: { _eq: $value }
              composite_key: { _eq: $compositeKey }
              key: { _eq: $key }
            }
            _and: [
              { height: { _gt: $heightGT } }
              { index: { _gt: $indexGT } }
              { height: { _lt: $heightLT } }
              { index: { _lt: $indexLT } }
              {
                event_attribute_index: {
                  value: { _eq: $value2 }
                  composite_key: { _eq: $compositeKey2 }
                  key: { _eq: $key2 }
                }
              }
            ]
          }
          order_by: { height: $order, index: $order }
        ) {
          id
          height
          hash
          timestamp
          code
          gas_used
          gas_wanted
          data
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
          hash: payload.hash,
          compositeKey: payload.compositeKey,
          value: payload.value,
          key: payload.key,
          heightGT: null,
          heightLT: payload.heightLT,
          indexGT: null,
          indexLT: null,
          height: null,
          compositeKey2: payload.compositeKey2,
          value2: payload.value2,
          key2: payload.key2,
        },
        operationName: 'auratestnet_transaction',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  txsDetailLcd(txhash: string) {
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.TX}/txs/${txhash}`);
  }

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
          compositeKey: [
            'send_packet.packet_sequence',
            'recv_packet.packet_sequence',
            'acknowledge_packet.packet_sequence',
            'timeout_packet.packet_sequence',
          ],
          value: sequence,
        },
        operationName: 'getListSequence',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}
