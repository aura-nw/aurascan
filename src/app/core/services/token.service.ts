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

  getListTokenHolderNFT(payload) {
    const operationsDoc = `
    query MyQuery($contract_address: String, $limit: Int = 10) {
      ${this.envDB} {
        view_count_holder_cw721(limit: $limit, where: {contract_address: {_eq: $contract_address}}, order_by: {count: desc}) {
          contract_address
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
    payload['contractAddress'] = "aura1vl8mq97m5r48sejm5rtlxc724mzjtgs80nseka00xx6vyysffk2s3kpavh";
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variable: {
          limit: payload?.limit || 20,
          contract_address: "",
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
    return this.http.post<any>(`${this.apiUrl}/cw721-tokens/get-by-contract/`,payload);
  }
}
