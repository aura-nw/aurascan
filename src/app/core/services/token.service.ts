import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LCD_COSMOS } from '../constants/url.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { RangeType } from '../models/common.model';
import { CommonService } from './common.service';

@Injectable()
export class TokenService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;
  indexerUrl = `${this.environmentService.configValue.indexerUri}`;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getListToken(payload): Observable<any> {
    const operationsDoc = `query queryCW20ListToken($name: String, $address: String, $limit: Int, $offset: Int) { 
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
        },
        operationName: 'queryCW20ListToken',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getTokenMarketData(payload = {}): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cw20-tokens/token-market`, payload);
  }

  getListCW721Token(payload, textSearch = null): Observable<any> {
    if (textSearch?.length > 0) {
      textSearch = '%' + textSearch + '%';
    }
    let querySort = `, order_by: {${payload.sort_column}: ${payload.sort_order}}`;
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

  getTokenDetail(address): Observable<any> {
    const operationsDoc = `query queryCW20Detail($address: String) { 
      ${this.envDB} { smart_contract(where: {address: {_eq: $address}}) {
          address
          cw20_contract {
            name
            symbol
            marketing_info
            cw20_holders {
              address
              amount
            }
            decimal
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
        },
        operationName: 'queryCW20Detail',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListTokenNFTFromIndexer(payload): Observable<any> {
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

  countTotalTokenCW721(contract_address): Observable<any> {
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

  getListTokenHolder(
    limit: string | number,
    offset: string | number,
    contractAddress: string,
  ): Observable<any> {
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

  getListTokenHolderNFT(payload) {
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

  getTokenMarket(coinId = 'aura-network') {
    return this.http.get<any>(`${this.apiUrl}/metrics/token-market?coinId=${coinId}`);
  }

  getTokenMetrics({ rangeType, coinId, min, max }: { rangeType: RangeType; coinId: string; min: number; max: number }) {
    return this.http.get<any>(`${this.apiUrl}/metrics/token`, {
      params: { rangeType, coinId, min, max },
    });
  }

  getListAssetCommunityPool() {
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.DISTRIBUTION}`);
  }
}
