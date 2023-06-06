import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { LENGTH_CHARACTER } from '../constants/common.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { RangeType } from '../models/common.model';
import { CommonService } from './common.service';
import { checkEnvQuery } from '../utils/common/info-common';
import { map } from 'rxjs/operators';
import { LCD_COSMOS } from '../constants/url.constant';
import axios from 'axios';

@Injectable()
export class TokenService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;
  indexerUrl = `${this.environmentService.configValue.indexerUri}`;
  envDB = checkEnvQuery(this.environmentService.configValue.env);
  graphUrl = `${this.environmentService.configValue.graphUrl}`;

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

  getListTokenTransferIndexerV2(pageLimit: string | number, contractAddress = '', filterData: any, nextKey = null) {
    const envDB = checkEnvQuery(this.environmentService.configValue.env);
    let filterQuery = '';
    if (filterData?.keyWord) {
      if (
        filterData?.keyWord.length === LENGTH_CHARACTER.TRANSACTION &&
        filterData?.keyWord == filterData?.keyWord.toUpperCase()
      ) {
        filterQuery = filterQuery.concat(`, hash: {_eq: "${filterData?.keyWord}" }`);
      } else if (filterData['isSearchWallet']) {
        filterQuery = filterQuery.concat(`, events: {event_attributes: {value: {_eq: "${filterData?.keyWord}" }}}`);
      } else {
        filterQuery = filterQuery.concat(
          `, events: {event_attributes: {key: {_eq: "token_id"}, value: {_eq: "${filterData?.keyWord}" }}}`,
        );
      }
    }
    if (nextKey) {
      filterQuery = filterQuery.concat(', id: {_lt: ' + `${nextKey}` + '}');
    }

    const operationsDoc = `
    query getListTx($limit: Int, $event_attr_val: String, $tx_msg_val: jsonb) {
      ${envDB} {
        transaction(limit: $limit, order_by: {timestamp: desc}, where: {_or: [{events: {event_attributes: {key: {_eq: "_contract_address"}, value: {_eq: $event_attr_val}}, type: {_eq: "execute"}}}, {transaction_messages: {content: {_contains: $tx_msg_val}}}] ${filterQuery} }) {
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
          event_attr_val: contractAddress,
          tx_msg_val: {
            contract: contractAddress,
          },
        },
        operationName: 'getListTx',
      })
      .pipe(map((res) => (res?.data ? res?.data[envDB] : null)));
  }

  getListTokenNFTFromIndexer(payload): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      owner: payload.owner,
      tokenId: payload.token_id,
      contractAddress: payload.contractAddress,
      pageLimit: payload.pageLimit,
      pageOffset: payload.pageOffset,
      // countTotal: true,
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

  getListTokenHolder(
    limit: string | number,
    offset: string | number,
    contractType: string,
    contractAddress: string,
  ): Observable<any> {
    let url = `${this.indexerUrl}/asset/holder?chainid=${this.chainInfo.chainId}&contractType=${contractType}&contractAddress=${contractAddress}&pageOffset=${offset}&pageLimit=${limit}&countTotal=true&reverse=false`;
    return this.http.get<any>(url);
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
}
