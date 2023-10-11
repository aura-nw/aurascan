import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LCD_COSMOS } from '../constants/url.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';
import { CW20_TRACKING, CW721_TRACKING } from '../constants/common.constant';

@Injectable()
export class TransactionService extends CommonService {
  apiUrl = `${this.environmentService.configValue.beUri}`;
  chainInfo = this.environmentService.configValue.chain_info;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getListTx(payload) {
    const operationsDoc = `
    query queryListTopTransaction(
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
        operationName: 'queryListTopTransaction',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListTxCondition(payload) {
    const operationsDoc = `
    query queryTransaction(
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
        operationName: 'queryTransaction',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getProposalDeposit(payload) {
    const operationsDoc = `
    query queryProposalDeposit(
      $limit: Int = 100
      $order: order_by = desc
      $value: String = null
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
            event_attributes: {
              value: { _eq: $value}
              composite_key: { _eq: "proposal_deposit.proposal_id"}
              key: { _eq: "proposal_id"}
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
          event_attributes{
            value
            composite_key
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: 100,
          order: 'desc',
          value: payload.value,
          heightGT: null,
          indexGT: null,
          indexLT: null,
          height: null,
        },
        operationName: 'queryProposalDeposit',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  txsDetailLcd(txhash: string) {
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.TX}/txs/${txhash}`);
  }

  getListIBCSequence(sequence, channel): Observable<any> {
    const operationsDoc = `
    query queryListSequence($limit: Int, $compositeKey: [String!] = "", $value: String = "", $channel: String = "") {
      ${this.envDB} {
        transaction(limit: $limit, where: {event_attributes: {composite_key: {_in: ["acknowledge_packet.packet_src_channel", "send_packet.packet_src_channel", "recv_packet.packet_src_channel"]}, value: {_eq: $channel}}, _and: {event_attributes: {composite_key: {_in: $compositeKey}, value: {_eq: $value}}}}) {
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
          channel: channel,
        },
        operationName: 'queryListSequence',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListTransferFromTx(hash): Observable<any> {
    const operationsDoc = `
      query TxTransferDetail(
        $height: Int
        $listFilterCW20: [String!] = null
        $listFilterCW721: [String!] = null
        $txHash: String = null
        $compositeKeyIn: [String!] = null
        $heightLTE: Int = null
        $heightGTE: Int = null
      ) {
        ${this.envDB} {
          cw20_activity(
            where: {
              height: { _eq: $height }
              amount: { _is_null: false }
              action: { _in: $listFilterCW20 }
            }
          ) {
            action
            amount
            from
            to
            cw20_contract {
              smart_contract {
                address
              }
              symbol
              decimal
              marketing_info
              name
            }
          }
          cw721_activity(
            where: {
              tx_hash: { _eq: $txHash }
              action: { _in: $listFilterCW721 }
              cw721_token: { token_id: { _is_null: false } }
              cw721_contract: {
                smart_contract: { name: { _neq: "crates.io:cw4973" } }
              }
            }
          ) {
            action
            from
            to
            cw721_token {
              token_id
            }
            cw721_contract {
              smart_contract {
                address
              }
            }
            smart_contract_event {
              smart_contract_event_attributes {
                value
                key
              }
            }
          }
          coin_transfer: event(
            where: {
              tx_msg_index: {_is_null: false}
              event_attributes: {
                composite_key: { _in: $compositeKeyIn }
                transaction: { hash: { _eq: $txHash } }
                block_height: { _lte: $heightLTE, _gte: $heightGTE }
              }
            }
          ) {
            event_attributes {
              composite_key
              value
            }
          }
        }
      }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          txHash: hash,
          compositeKeyIn: ['transfer.sender', 'transfer.recipient'],
        },
        operationName: 'TxTransferDetail',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}
