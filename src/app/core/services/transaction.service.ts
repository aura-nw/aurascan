import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LCD_COSMOS } from '../constants/url.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class TransactionService extends CommonService {
  apiUrl = `${this.environmentService.configValue.beUri}`;
  chainInfo = this.environmentService.configValue.chain_info;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getListTx(payload) {
    const operationsDoc = `
    query getListTx(
      $limit: Int = 100
      $order: order_by = desc
      $heightGT: Int = null
      $heightLT: Int = null
      $indexGT: Int = null
      $indexLT: Int = null
      $hash: String = null
      $height: Int = null
    ) {
      ${this.envDB} {
        transaction(
          limit: $limit
          where: {
            hash: { _eq: $hash }
            height: { _eq: $height }
            _and: [
              { height: { _gt: $heightGT } }
              { index: { _gt: $indexGT } }
              { height: { _lt: $heightLT } }
              { index: { _lt: $indexLT } }
            ]
          }
          order_by: [{ height: $order}, {index: $order }]
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
          value: payload.value,
          key: payload.key,
          heightGT: null,
          heightLT: payload.heightLT,
          indexGT: null,
          indexLT: null,
          height: null,
        },
        operationName: 'getListTx',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListTxCondition(payload) {
    const operationsDoc = `
    query getListTxCondition(
      $limit: Int = 100
      $order: order_by = desc
      $compositeKey: String = null
      $value: String = null
      $key: String = null
      $compositeKeyIn: [String!] = null
      $valueIn: [String!] = null
      $keyIn: [String!] = null
      $heightGT: Int = null
      $heightLT: Int = null
      $indexGT: Int = null
      $indexLT: Int = null
      $hash: String = null
      $height: Int = null
    ) {
      ${this.envDB} {
        transaction(
          limit: $limit
          where: {
            hash: { _eq: $hash }
            height: { _eq: $height }
            event_attribute_index: {
              value: { _eq: $value, _in: $valueIn }
              composite_key: { _eq: $compositeKey, _in: $compositeKeyIn }
              key: { _eq: $key, _in: $keyIn }
            }
            _and: [
              { height: { _gt: $heightGT } }
              { index: { _gt: $indexGT } }
              { height: { _lt: $heightLT } }
              { index: { _lt: $indexLT } }
            ]
          }
          order_by: [{ height: $order}, {index: $order }]
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
        },
        operationName: 'getListTxCondition',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListTxMultiCondition(payload) {
    const operationsDoc = `
    query getListTxMultiCondition(
      $limit: Int = 100
      $order: order_by = desc
      $compositeKey: String = null
      $value: String = null
      $key: String = null
      $compositeKey2: String = null
      $value2: String = null
      $key2: String = null
      $compositeKeyIn: [String!] = null
      $valueIn: [String!] = null
      $keyIn: [String!] = null
      $compositeKeyIn2: [String!] = null
      $valueIn2: [String!] = null
      $keyIn2: [String!] = null
      $heightGT: Int = null
      $heightLT: Int = null
      $indexGT: Int = null
      $indexLT: Int = null
      $hash: String = null
      $height: Int = null
    ) {
      ${this.envDB} {
        transaction(
          limit: $limit
          where: {
            hash: { _eq: $hash }
            height: { _eq: $height }
            event_attribute_index: {
              value: { _eq: $value, _in: $valueIn }
              composite_key: { _eq: $compositeKey, _in: $compositeKeyIn }
              key: { _eq: $key, _in: $keyIn }
            }
            _and: [
              { height: { _gt: $heightGT } }
              { index: { _gt: $indexGT } }
              { height: { _lt: $heightLT } }
              { index: { _lt: $indexLT } }
              {
                event_attribute_index: {
                  value: { _eq: $value2, _in: $valueIn2 }
                  composite_key: { _eq: $compositeKey2, _in: $compositeKeyIn2 }
                  key: { _eq: $key2, _in: $keyIn2 }
                }
              }
            ]
          }
          order_by: [{ height: $order}, {index: $order }]
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
        operationName: 'getListTxMultiCondition',
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
          event_attributes (where: {_and: {composite_key: {_eq: "transfer.amount"}, value: {_like: "%ibc%"}}}) {
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
