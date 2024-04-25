import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CW20_TRACKING, CW721_TRACKING } from '../constants/common.constant';
import { LCD_COSMOS } from '../constants/url.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';
import { titleCaseWord } from 'src/app/global/global';

@Injectable()
export class TransactionService extends CommonService {
  chainInfo = this.environmentService.chainInfo;

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
  ) {
    super(http, environmentService);
  }

  queryTransactionByEvmHash(payload) {
    const operationsDoc = `
    query QueryTransactionByEvmHash(
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
            evm_transaction: {hash: {_eq: $hash}}
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
          fee
          memo
          codespace
          gas_limit    
          transaction_messages {
            content
            sender
          }
          evm_transaction {
            hash
            from
            gas
            data
            gas_fee_cap
            gas_tip_cap
            height
            id
            nonce
            size
            to
            tx_id
            tx_msg_id
            value
            contract_address
            status
            reason
            evm_events {
              address
              topic0
              topic1
              topic2
              topic3
              data
              evm_signature_mapping_topic0 {
                human_readable_topic
              }
            }
            erc20_activities {
              amount
              erc20_contract {
                decimal
                symbol
                address
              }
            }
           evm_internal_transactions {
              type_trace_address
              from
              to
              value
              gas
              gas_used
           }
          }
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
          height: payload.height,
        },
        operationName: 'QueryTransactionByEvmHash',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  queryEvmTransactionList(payload) {
    const operationsDoc = `
    query QueryEvmTransactionList(
      $limit: Int = 20
      $order: order_by = desc
    ) {
      ${this.envDB} {
        transaction(
          limit: $limit
          order_by: [{ height: $order}],
          where: {evm_transaction: {hash: {_is_null: false}}}
        ) {
          id
          hash
          height
          timestamp
          transaction_messages {
            type
            content
            sender
          }
          evm_transaction {
            from
            hash
            to
            data
            value
            erc20_activities {
              amount
              erc20_contract {
                address
                decimal
                symbol
              }
            }
          }
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
        },
        operationName: 'QueryEvmTransactionList',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListEvmContractTxByAddress(payload) {
    const operationsDoc = `
    query QueryEvmTxOfContract( $limit: Int = null, $address: String = null) {
      ${this.envDB} {
        evm_transaction(where: {evm_events: {address: {_eq: $address}}}, limit: $limit, order_by: {id: desc}) {
          from
          to
          hash
          height
          data
          value
          contract_address
          transaction {
            timestamp
          }
        }
      }
    }
    `;

    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload.limit || 40,
          address: payload.address,
        },
        operationName: 'QueryEvmTxOfContract',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListTxDetail(payload) {
    const operationsDoc = `
    query queryTxDetail(
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
          fee
          memo
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
        operationName: 'queryTxDetail',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
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
          order_by: [{ height: $order }, { index: $order }]
        ) {
          id
          height
          hash
          timestamp
          code
          gas_used
          gas_wanted
          fee
          data(path: "tx.body.messages")
          transaction_messages {
            type
            content
          }
          evm_transaction {
            hash
          }
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
          height: payload.height,
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
          fee
          transaction_messages {
            content
          }
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

  getListOutgoing(payload) {
    const operationsDoc = `    
    query queryTransaction(  
      $limit: Int = 100
      $heightGT: Int = null
      $heightLT: Int = null
      $hash: String = null
      $height: Int = null
      $actionEq: String = null
      $actionNEq: String = null
      $value: String = null
    ) {
      ${this.envDB} {
        transaction(
          limit: $limit
          where: {
            hash: { _eq: $hash }
            height: { _eq: $height }
            smart_contract_events: {
              smart_contract: { address: { _eq: $value } }
              _and: [
                { action: { _eq: $actionEq } }
                { action: { _nlike: $actionNEq } }
              ]
            }
            _and: [
              { height: { _gt: $heightGT } }
              { height: { _lt: $heightLT } }
            ]
          }
          order_by: { height: desc }
        ) {
          id
          height
          hash
          timestamp
          code
          data
          fee
          transaction_messages {
            content
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload.limit,
          heightGT: null,
          heightLT: null,
          height: null,
          actionNEq: payload.actionNEq,
          actionEq: payload.actionEq,
          value: payload.value,
        },
        operationName: 'queryTransaction',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getProposalDepositor(payload) {
    const operationsDoc = `
    query queryProposalDepositor(
      $limit: Int = 100
      $order: order_by = desc
      $value: String = null
      $heightGT: Int = null
      $heightLT: Int = null
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
              block_height: { _lte: $heightLT, _gte: $heightGT }
            }
          }
          order_by: [{ height: $order}, {index: $order }]
        ) {
          id
          height
          hash
          timestamp
          transaction_messages {
            content
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
          heightGT: payload.heightGT,
          heightLT: payload.heightLT,
        },
        operationName: 'queryProposalDepositor',
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

  getListTransferFromTx(hash, height = null): Observable<any> {
    const operationsDoc = `
    query TxTransferDetail(
      $listFilterCW20: [String!] = null
      $listFilterCW721: [String!] = null
      $txHash: String = null
      $msgTypeNotIn: [String!] = null
      $compositeKeyIn: [String!] = null
      $heightGTE: Int = null
      $heightLTE: Int = null
    ) {
      ${this.envDB} {
        cw20_activity(
          where: {
            tx_hash: { _eq: $txHash }
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
        coin_transfer: transaction(
          where: {
            hash: { _eq: $txHash }
            transaction_messages: { type: { _nin: $msgTypeNotIn } }
          }
        ) {
          event_attributes(
            where: {
              composite_key: { _in: $compositeKeyIn }
              event: { tx_msg_index: { _is_null: false } }
              block_height: { _lte: $heightLTE, _gte: $heightGTE }
            }
            order_by: [{event_id: asc}, {index: asc}]
          ) {
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
          compositeKeyIn: ['coin_spent.spender', 'coin_received.receiver', 'coin_spent.amount', 'coin_received.amount'],
          listFilterCW20: CW20_TRACKING,
          listFilterCW721: CW721_TRACKING,
          heightLTE: height,
          heightGTE: height,
        },
        operationName: 'TxTransferDetail',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListEVMTransferFromTx(hash, height = null): Observable<any> {
    const operationsDoc = `
    query EvmTxTransferDetail(
      $listFilterCW20: [String!] = null
      $listFilterCW721: [String!] = null
      $txHash: String = null
      $msgTypeNotIn: [String!] = null
      $compositeKeyIn: [String!] = null
      $heightGTE: Int = null
      $heightLTE: Int = null
    ) {
      ${this.envDB} {
        erc20_activity(where: {tx_hash: {_eq: $txHash}, amount: {_is_null: false}, action: {_in: $listFilterCW20}}) {
          action
          amount
          from
          to
          erc20_contract {
            evm_smart_contract {
              address
            }
            symbol
            decimal
            name
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
          // compositeKeyIn: ['coin_spent.spender', 'coin_received.receiver', 'coin_spent.amount', 'coin_received.amount'],
          listFilterCW20: CW20_TRACKING,
          // listFilterCW721: CW721_TRACKING,
          // heightLTE: height,
          // heightGTE: height,
        },
        operationName: 'EvmTxTransferDetail',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getAbiContract(address: string) {
    const operationsDoc = `
    query QueryAbiContract($address: String = null) {
      ${this.envDB} {
        evm_contract_verification(where: {contract_address: {_eq: $address}, status: {_eq: "SUCCESS"}}, limit: 1, order_by: {id: desc}) {
          contract_address
          created_at
          creator_tx_hash
          id
          status
          updated_at
          abi
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
        operationName: 'QueryAbiContract',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListMappingName(methodId: any): Observable<any> {
    const operationsDoc = `
    query queryListNameMethod($limit: Int = 100, $methodId: [String!] = null) {
      ${this.envDB} {
        evm_signature_mapping(where: {function_id: {_in: $methodId}}) {
          function_id
          human_readable_topic
        }
      }
    }
    `;

    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          methodId: methodId,
        },
        operationName: 'queryListNameMethod',
      })
      .pipe(
        map((res) => (res?.data ? res?.data[this.envDB] : null)),
        map((res) => {
          return res?.evm_signature_mapping?.reduce((pre, current) => {
            let methodName = current?.human_readable_topic?.replace('function ', '');
            methodName = titleCaseWord(methodName?.substring(0, methodName?.indexOf('(')));
            pre[current?.function_id] = methodName || current?.human_readable_topic;
            return pre;
          }, {});
        }),
      );
  }
}
