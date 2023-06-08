import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import * as _ from 'lodash';
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
  envDB = this.environmentService.configValue.horoscopeSelectedChain;
   graphUrl = `${
    this.environmentService.configValue.horoscopeUrl + this.environmentService.configValue.horoscopePathGraphql
  }`;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getListToken(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cw20-tokens`, payload);
  }

  getListCW721Token(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cw721-tokens`, payload);
  }

  getTokenDetail(address): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/contracts/token/${address}`);
  }

  getTokenCW721Detail(address): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cw721-tokens/${address}`);
  }

  getListTokenNFTFromIndexer(payload): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      owner: payload.owner,
      tokenId: payload.token_id,
      contractAddress: payload.contractAddress,
      pageLimit: payload.pageLimit,
      pageOffset: payload.pageOffset,
      contractType: payload.contractType,
      isBurned: false,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();
    return this.http.get<any>(`${this.indexerUrl}/asset/getByOwner`, {
      params,
    });
  }

  getListTokenNFTFromIndexerV2(payload): Observable<any> {
    const operationsDoc = `
    query Query(
      $contract_address: String
      $limit: Int = 10
      $nextKeyLastUpdatedHeight: Int = null
      $nextKeyId: Int = null
      $tokenId: String = null
      $owner: String = null
    ) {
      ${this.envDB} {
        cw721_token(
          limit: $limit
          where: {
            cw721_contract: {
              smart_contract: { address: { _eq: $contract_address } }
            }
            id: { _lt: $nextKeyId }
            last_updated_height: { _lt: $nextKeyLastUpdatedHeight }
            token_id: { _eq: $tokenId }
            owner: { _eq: $owner }
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
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload?.limit || 20,
          contract_address: payload?.contractAddress,
          nextKeyLastUpdatedHeight: payload?.nextKey,
          nextKeyId: payload?.nextKeyId,
          tokenId: payload?.token_id,
          owner: payload?.owner
        },
        operationName: 'Query',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListTokenHolder(
    limit: string | number,
    offset: string | number,
    contractType: string,
    contractAddress: string,
  ): Observable<any> {
    let url = `${this.indexerUrl}/asset/holder?chainid=${this.chainInfo.chainId}&contractType=${contractType}&contractAddress=${contractAddress}&pageOffset=${offset}&pageLimit=${limit}&countTotal=true&reverse=false`;
    return this.http.get<any>(url);
  }

  getListTokenHolderNFT(payload) {
    const operationsDoc = `
    query MyQuery($contract_address: String, $limit: Int = 10) {
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
        operationName: 'MyQuery',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getContractDetail(tokenAddress): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/contracts/${tokenAddress}`);
  }

  getNFTDetail(contractAddress: string, tokenId): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cw721-tokens/${contractAddress}/nft/${tokenId}`);
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

  getAssetCW721ByContract(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cw721-tokens/get-by-contract/`, payload);
  }
}
