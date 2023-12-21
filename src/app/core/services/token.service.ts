import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import * as _ from 'lodash';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CW20_TRACKING } from '../constants/common.constant';
import { LCD_COSMOS } from '../constants/url.constant';
import { CoingeckoService } from '../data-services/coingecko.service';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable({ providedIn: 'root' })
export class TokenService extends CommonService {
  chainInfo = this.environmentService.chainInfo;
  tokensMarket$ = new BehaviorSubject<any[]>(null);

  get tokensMarket() {
    return this.tokensMarket$.getValue();
  }

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
    private coingeckoService: CoingeckoService,
  ) {
    super(http, environmentService);
  }

  getListToken(payload): Observable<any> {
    const operationsDoc = `query queryCW20ListToken($name: String, $address: String, $limit: Int, $offset: Int, $date: date) { 
      ${this.envDB} { 
        cw20_contract(where: {_or: [{name: {_ilike: $name}}, {smart_contract: {address: {_eq: $address}}}]}, limit: $limit, offset: $offset) {
          marketing_info
          name
          symbol
          smart_contract {
            address
          }
          cw20_holders_aggregate(where: {amount: {_gt: "0"}}) {
            aggregate {
              count
            }
          }
          cw20_total_holder_stats(where: {date: {_gte: $date}}) {
            date
            total_holder
          }
        }
        cw20_contract_aggregate(where: {_or: [{name: {_ilike: $name}}, {smart_contract: {address: {_eq: $address}}}]}) {
          aggregate {
            count
          }
        }
      }
    }`;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          name: payload?.keyword ? `%${payload?.keyword}%` : null,
          address: payload?.keyword ? payload?.keyword : null,
          limit: payload?.limit,
          offset: payload?.offset,
          date: payload?.date,
        },
        operationName: 'queryCW20ListToken',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getTokenMarketData(payload = {}): Observable<any> {
    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();

    return this.http.get<any>(`${this.apiUrl}/cw20-tokens/token-market`, {
      params,
    });
  }

  getListCW721Token(payload, textSearch: string = null): Observable<any> {
    if (textSearch?.length > 0) {
      textSearch = '%' + textSearch + '%';
    }
    let querySort = `, order_by: [{${payload.sort_column}: ${payload.sort_order}}, {id: desc}]`;
    const operationsDoc = `
    query queryListCW721($limit: Int = 10, $offset: Int = 0, $contract_address: String = null, $name: String = null) {
      ${this.envDB} {
        list_token: cw721_contract_stats(limit: $limit, offset: $offset ${querySort}, where: {_or:[ {cw721_contract: {smart_contract: {address: {_like: $contract_address}}}},  { cw721_contract: {name: {_ilike: $name}}} ]}) {
          transfer_24h
          total_activity
          cw721_contract {
            name
            symbol
            smart_contract {
              address
            }
          }
        }
        total_token: cw721_contract_stats_aggregate (where: {_or:[ {cw721_contract: {smart_contract: {address: {_like: $contract_address}}}},  { cw721_contract: {name: {_ilike: $name}}} ]}) {
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
          limit: payload.limit || 20,
          offset: payload.offset || 0,
          contract_address: textSearch || null,
          name: textSearch || null,
        },
        operationName: 'queryListCW721',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getTokenDetail(address: string, date): Observable<any> {
    const operationsDoc = `query queryCW20Detail($address: String, $date: date) { 
      ${this.envDB} { smart_contract(where: {address: {_eq: $address}}) {
          address
          cw20_contract {
            name
            symbol
            marketing_info
            decimal
            smart_contract {
              address
            }
            cw20_holders {
              address
              amount
            }
            cw20_total_holder_stats(where: {date: {_gte: $date}}) {
              date
              total_holder
            }
          }
          code {
            code_id_verifications(order_by: {updated_at: desc}) {
              verification_status
            }
          }
        } 
      } 
    }`;

    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          address: address,
          date: date,
        },
        operationName: 'queryCW20Detail',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListTokenNFTFromIndexer(payload: {
    limit: number;
    offset: number;
    contractAddress: string;
    token_id: string;
    owner: string;
  }): Observable<any> {
    const operationsDoc = `
    query queryListInventory(
      $contract_address: String
      $limit: Int = 10
      $tokenId: String = null
      $owner: String = null
      $offset: Int = 0
    ) {
      ${this.envDB} {
        cw721_token(
          limit: $limit
          offset: $offset
          where: {
            cw721_contract: {
              smart_contract: { address: { _eq: $contract_address } }
            }
            token_id: { _eq: $tokenId }
            owner: { _eq: $owner }
            burned: {_eq: false}
          }
          order_by: [{ last_updated_height: desc }, { id: desc }]
        ) {
          id
          token_id
          owner
          media_info
          last_updated_height
          created_at
          burned
        }
        cw721_token_aggregate(
          where: {
          cw721_contract: { 
            smart_contract: { 
              address: { _eq: $contract_address }
            }
          }
          token_id: { _eq: $tokenId }
          owner: { _eq: $owner }
          burned: {_eq: false}
        }
        ) {
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
          limit: payload?.limit || 20,
          offset: payload.offset,
          contract_address: payload?.contractAddress,
          tokenId: payload?.token_id,
          owner: payload?.owner,
        },
        operationName: 'queryListInventory',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  countTotalTokenCW721(contract_address: string): Observable<any> {
    const operationsDoc = `
    query queryCountTotalToken721($contract_address: String) {
      ${this.envDB} {
        cw721_token_aggregate(where: {cw721_contract: {smart_contract: {address: {_eq: $contract_address}}}, burned: {_eq: false}}) {
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
          contract_address: contract_address,
        },
        operationName: 'queryCountTotalToken721',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListTokenHolder(limit: string | number, offset: string | number, contractAddress: string): Observable<any> {
    const operationsDoc = `query queryCW20ListHolder($address: String, $limit: Int, $offset: Int) {
      ${this.envDB} {
        cw20_holder(where: {cw20_contract: {smart_contract: {address: {_eq: $address}}}, amount: {_gt: "0"}}, limit: $limit, offset: $offset, order_by: {amount: desc}) {
          amount
          address
          cw20_contract {
            total_supply
            decimal
          }
        }
        cw20_holder_aggregate(where: {cw20_contract: {smart_contract: {address: {_eq: $address}}}, amount: {_gt: "0"}}) {
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
          limit: limit,
          offset: offset,
          address: contractAddress,
        },
        operationName: 'queryCW20ListHolder',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListTokenHolderNFT(payload: { limit: number; contractAddress: string }) {
    const operationsDoc = `
    query queryListHolderNFT($contract_address: String, $limit: Int = 10) {
      ${this.envDB} {
        view_count_holder_cw721(limit: $limit, where: {contract_address: {_eq: $contract_address}}, order_by: {count: desc}) {
          count
          owner
        }
        view_count_holder_cw721_aggregate(where: {contract_address: {_eq: $contract_address}}) {
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
          limit: payload?.limit || 20,
          contract_address: payload?.contractAddress,
        },
        operationName: 'queryListHolderNFT',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getPriceToken(tokenId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cw20-tokens/price/${tokenId}`);
  }

  getListAssetCommunityPool() {
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.DISTRIBUTION}`);
  }

  getCW721Transfer(payload: {
    isCW4973?: boolean;
    isNFTDetail?: boolean;
    contractAddr?: string;
    sender?: string;
    receiver?: string;
    tokenId?: string;
    idLte?: string;
    txHash?: string;
  }): Observable<any> {
    let queryName = payload.isCW4973 ? 'CW4973Transfer' : 'CW721Transfer';
    let queryCondition = payload.isCW4973 ? '_eq' : '_neq';
    let queryActionNotIn = payload.isNFTDetail
      ? ['']
      : ['approve', 'instantiate', 'revoke', 'approve_all', 'revoke_all', ''];
    const operationsDoc = `query ${queryName}(
      $contractAddress: String = null
      $actionNotIn: [String!] = null
      $idLte: Int = null
      $idGte: Int = null
      $receiver: String = null
      $sender: String = null
      $tokenId: String = null
      $txHash: String = null) {
      ${this.envDB} {
        cw721_activity(
          where: {
            _or: [{ to: { _eq: $receiver } }, { from: { _eq: $sender } }]
            cw721_contract: {
              smart_contract: {
                address: { _eq: $contractAddress }
                name: { ${queryCondition}: "crates.io:cw4973" }
              }
            }
            cw721_token: { token_id: { _eq: $tokenId } }
            id: { _lte: $idLte, _gte: $idGte }
            action: { _nin: $actionNotIn }
            tx_hash: {_eq: $txHash}
          }
          order_by: { id: desc }
        ) {
          id
          action
          from
          to
          sender
          cw721_token {
            token_id
            cw721_contract {
              smart_contract {
                address
              }
            }
          }
          tx {
            hash
            height
            timestamp
            code
            transaction_messages {
              content
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
          contractAddress: payload.contractAddr,
          actionNotIn: queryActionNotIn,
          sender: payload.sender,
          receiver: payload.receiver,
          tokenId: payload.tokenId,
          idLte: payload.idLte,
          txHash: payload.txHash,
        },
        operationName: queryName,
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getCW20Transfer(payload): Observable<any> {
    const operationsDoc = `query queryListTxsCW20(
      $receiver: String = null
      $sender: String = null
      $contractAddr: String = null
      $heightGT: Int = null
      $heightLT: Int = null
      $limit: Int = 100
      $txHash: String = null
      $actionIn: [String!] = null
      $actionNotIn: [String!] = null) {
      ${this.envDB} {
        cw20_activity(
          where: {
            _or: [{ to: { _eq: $receiver } }, { from: { _eq: $sender } }]
            cw20_contract: { smart_contract: { address: { _eq: $contractAddr } } }
            action: { _in: $actionIn, _nin: $actionNotIn }
            height: { _gt: $heightGT, _lt: $heightLT }
            tx_hash: { _eq: $txHash }
          }
          order_by: { height: desc }
          limit: $limit
        ) {
          action
          amount
          from
          to
          sender
          cw20_contract {
            smart_contract {
              address
            }
            decimal
            symbol
          }
          tx {
            hash
            height
            timestamp
            code
            transaction_messages {
              type
              content
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
          sender: payload.sender,
          receiver: payload.receiver,
          listTxMsgType: payload.listTxMsgType,
          contractAddr: payload.contractAddr,
          heightLT: payload.heightLT,
          txHash: payload.txHash,
          actionIn: CW20_TRACKING,
          actionNotIn: null,
        },
        operationName: 'queryListTxsCW20',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getCoinData() {
    this.http
      .get<any>(`${this.apiUrl}/cw20-tokens/token-market`)
      .pipe(
        switchMap((res: any[]) => {
          if (res?.length === 0) {
            return of(null);
          }

          const tokensFiltered = res.filter((token) => token.coin_id);

          const coinsId = tokensFiltered.map((coin: { coin_id: string }) => coin.coin_id);
          if (coinsId?.length > 0) {
            return forkJoin({
              tokensMarket: of(tokensFiltered),
              coinMarkets: this.getCoinMarkets(coinsId),
            });
          }

          return forkJoin({
            tokensMarket: of(tokensFiltered),
            coinMarkets: of(null),
          });
        }),
        map((data) => {
          if (data) {
            const { coinMarkets, tokensMarket } = data;

            return tokensMarket.map((token) => {
              if (!token.coin_id) {
                return token;
              }

              const coin = coinMarkets.find((item) => item.id === token.coin_id);

              if (!coin) {
                return token;
              }

              return {
                ...token,
                max_supply: coin.max_supply,
                current_price: coin.current_price,
                price_change_percentage_24h: coin.price_change_percentage_24h,
                total_volume: coin.total_volume,
                circulating_supply: coin.circulating_supply,
                fully_diluted_valuation: coin.fully_diluted_valuation,
              };
            });
          }
          return [];
        }),
      )
      .subscribe((res) => {
        this.tokensMarket$.next(res);
      });
  }

  getCoinMarkets(coinsId: string[]): Observable<any[]> {
    return this.coingeckoService.getCoinMarkets(coinsId).pipe(catchError((_) => of([])));
  }

  getListTransactionTokenIBC(denom_hash: string): Observable<any> {
    const operationsDoc = `
    query DenomTransfer(
      $denom_hash: String = null
      $limit: Int = null
      $offset: Int = null
      $address: String = null
    ) {
      ${this.envDB} {
        ibc_ics20(
          where: { denom: { _eq: $denom_hash } _or: [{receiver: {_eq: $address}}, {sender: {_eq: $address}}]}
          order_by: { id: desc }
          limit: $limit
          offset: $offset
        ) {
          denom
          sender
          receiver
          amount
          ibc_message {
            transaction {
              hash
              transaction_messages {
                type
              }
              timestamp
              code
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
        operationName: 'DenomTransfer',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getDenomHolder(payload): Observable<any> {
    const operationsDoc = `
    query DenomHolder(
      $denom: String = null
      $limit: Int = null
      $offset: Int = null
      $address: String = null
    ) {
      ${this.envDB} {
        account(
          where: {
            balances: { _contains: [{ denom: $denom }] }
            address: { _eq: $address }
          }
          order_by: {}
          limit: $limit
          offset: $offset
        ) {
          address
          balances
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          denom: 'ibc/40CA5EF447F368B7F2276A689383BE3C427B15395D4BF6639B605D36C0846A20'
        },
        operationName: 'DenomHolder',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}
