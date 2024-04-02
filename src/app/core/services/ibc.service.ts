import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';
import { catchError, map } from 'rxjs/operators';
import axios from 'axios';
import { LCD_COSMOS } from '../constants/url.constant';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IBCService extends CommonService {
  listInfoChain = [];

  chainInfo = this.environmentService.chainInfo;
  lcd = this.environmentService.chainConfig.chain_info.rest;

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
  ) {
    super(http, environmentService);
  }

  getRelayerInfo() {
    const operationsDoc = `
    query IbcRelayersStat {
      ${this.envDB} {
        total_connected_chain: m_view_ibc_relayer_statistic_aggregate {
          aggregate {
            count
          }
        }
        total_opening_channels: m_view_ibc_relayer_statistic_aggregate {
          aggregate {
            sum {
              open_channel
            }
          }
        }
        total_channels: m_view_ibc_relayer_statistic_aggregate {
          aggregate {
            sum {
              total_channel
            }
          }
        }
        total_send: m_view_ibc_relayer_statistic_aggregate {
          aggregate {
            sum {
              send_asset_transfer
            }
          }
        }
        total_receive: m_view_ibc_relayer_statistic_aggregate {
          aggregate {
            sum {
              receive_asset_transfer
            }
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {},
        operationName: 'IbcRelayersStat',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListInfoChain() {
    return this.http.get<any>(`${this.apiUrl}/chain-info`);
  }

  getListIbcRelayer() {
    const operationsDoc = `
    query ChainConnected(
      $chain_name: String = null
      $limit: Int = null
      $offset: Int = null
    ) {
      ${this.envDB} {
        m_view_ibc_relayer_statistic(
          where: { counterparty_chain_id: { _ilike: $chain_name } }
          limit: $limit
          offset: $offset
          order_by: { total_asset_transfer: desc }
        ) {
          chain: counterparty_chain_id
          total_asset_transfer
          receive_asset_transfer
          send_asset_transfer
          open_channel
          total_channel
          created_at
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {},
        operationName: 'ChainConnected',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListRelayerDetail(payload: { limit: number; offset: number; chain_id: string }) {
    const operationsDoc = `
    query RelayerDetail(
      $chain_id: String = null
      $limit: Int = null
      $offset: Int = null
    ) {
      ${this.envDB} {
        ibc_channel(
          where: {
            ibc_connection: {
              ibc_client: { counterparty_chain_id: { _eq: $chain_id } }
            }
          }
          order_by: { ibc_ics20s_aggregate: { count: desc } }
          limit: $limit
          offset: $offset
        ) {
          channel_id
          counterparty_channel_id
          state
          ibc_connection {
            ibc_client {
              counterparty_chain_id
              operating_since_1: consensus_state(path: "timestamp")
              operating_since_2: consensus_state(path: "consensus_state.timestamp")
            }
          }
          total: ibc_ics20s_aggregate(where: { status: { _eq: "ack_success" } }) {
            aggregate {
              count(columns: id)
            }
          }
          receive: ibc_ics20s_aggregate(
            where: { type: { _eq: "recv_packet" }, status: { _eq: "ack_success" } }
          ) {
            aggregate {
              count(columns: id)
            }
          }
          send: ibc_ics20s_aggregate(
            where: { type: { _eq: "send_packet" }, status: { _eq: "ack_success" } }
          ) {
            aggregate {
              count(columns: id)
            }
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: { ...payload },
        operationName: 'RelayerDetail',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getChannelDetail(channel_id: string, counterparty_channel_id: string) {
    const operationsDoc = `
    query ChannelDetail(
      $counterparty_channel_id: String = null
      $channel_id: String = null
    ) {
      ${this.envDB} {
        ibc_channel(
          where: {
            channel_id: { _eq: $channel_id }
            counterparty_channel_id: { _eq: $counterparty_channel_id }
          }
        ) {
          channel_id
          counterparty_channel_id
          ibc_connection {
            ibc_client {
              operating_since_1: consensus_state(path: "timestamp")
              operating_since_2: consensus_state(path: "consensus_state.timestamp")
              client_id
              counterparty_chain_id
            }
          }
          total_tx: ibc_ics20s_aggregate(where: { status: { _eq: "ack_success" } }) {
            aggregate {
              count(columns: id)
            }
          }
          sending_asset_denoms: ibc_ics20s_aggregate(
            where: { type: { _eq: "send_packet" }, status: { _eq: "ack_success" } }
            distinct_on: denom
          ) {
            nodes {
              denom
              type
            }
          }
          receving_asset_denoms: ibc_ics20s_aggregate(
            where: { type: { _eq: "recv_packet" }, status: { _eq: "ack_success" } }
            distinct_on: denom
          ) {
            nodes {
              denom
              type
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
          channel_id: channel_id,
          counterparty_channel_id: counterparty_channel_id,
        },
        operationName: 'ChannelDetail',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListTxChannel(payload: { limit: number; channel_id: string; offset: number }) {
    const operationsDoc = `
    query TxOfChannel(
      $id_gte: Int = null
      $id_lte: Int = null
      $channel_id: String = null
      $limit: Int = null
      $offset: Int = null
    ) {
      ${this.envDB} {
        ibc_ics20(
          where: {
            channel_id: { _eq: $channel_id }
            id: { _gt: $id_gte, _lte: $id_lte }
            status: { _eq: "ack_success" }
          }
          order_by: { id: desc }
          limit: $limit
          offset: $offset
        ) {
          denom
          amount
          ibc_message {
            transaction {
              code
              timestamp
              fee
              height
              hash
              transaction_messages {
                type
                content
              }
            }
          }
          status
        }
        total_tx: ibc_ics20_aggregate(
          where: {
            channel_id: { _eq: $channel_id }
            status: { _eq: "ack_success" }
          }
        ) {
          aggregate {
            count(columns: id)
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          ...payload,
        },
        operationName: 'TxOfChannel',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getTransferAsset(payload: { channel_id: string; counterparty_channel_id: string; type: string }) {
    const operationsDoc = `
    query IbcChannelDetailStat(
      $channel_id: String = null
      $counterparty_channel_id: String = null
      $type: String = null
      $denom: String = null
    ) {
      ${this.envDB} {
        view_ibc_channel_detail_statistic(
          where: {
            channel_id: { _eq: $channel_id }
            counterparty_channel_id: { _eq: $counterparty_channel_id }
            type: {_eq: $type}
            denom: {_eq: $denom}
          }
          order_by: {total_messages: desc}
        ) {
          denom
          total_messages
          type
          amount
          channel_id
          counterparty_channel_id
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: { ...payload },
        operationName: 'IbcChannelDetailStat',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getTotalSupplyLCD(denomHash: string) {
    // Cosmos SDK version 0.47.0 - Rest API
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.SUPPLY}/by_denom?denom=${denomHash}`).catch(() => ({
      amount: {
        denom: denomHash,
        amount: '0',
      },
    }));
  }

  getChannelInfoByDenom(denomHash: string) {
    return this.http
      .get<any>(`${this.chainInfo.rest}/ibc/apps/transfer/v1/denom_traces/${denomHash}`)
      .pipe(catchError((_) => of([])));
  }

  getDenomTotalHolder(denomHash: string) {
    const operationsDoc = `
    query DenomTotalHolder ($denom: String = null) {
      ${this.envDB} {
        account_aggregate(where: {balances: {_contains: [{denom: $denom}]}}) {
          aggregate {
            count
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          denom: denomHash,
        },
        operationName: 'DenomTotalHolder',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getChannelCounter(channel_id: string) {
    const operationsDoc = `
    query CounterPartyChannel($channel_id: String = null) {
      ${this.envDB} {
        ibc_channel(where: {channel_id: {_eq: $channel_id}}) {
          channel_id
          counterparty_channel_id
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          channel_id: channel_id,
        },
        operationName: 'CounterPartyChannel',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}
