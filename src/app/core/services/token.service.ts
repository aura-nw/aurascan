import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { LENGTH_CHARACTER } from '../constants/common.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class TokenService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;
  indexerUrl = `${this.environmentService.configValue.indexerUri}`;

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

  getListTokenTransferIndexer(pageLimit: string | number, contractAddress: string, filterData: any, nextKey = null) {
    const params = _({
      chainid: this.chainInfo.chainId,
      searchType: 'execute',
      searchKey: '_contract_address',
      searchValue: contractAddress,
      needFullLog: true,
      pageLimit,
      nextKey,
      countTotal: true,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    if (filterData?.keyWord) {
      if (
        filterData?.keyWord.length === LENGTH_CHARACTER.TRANSACTION &&
        filterData?.keyWord == filterData?.keyWord.toUpperCase()
      ) {
        params['txHash'] = filterData?.keyWord;
      } else if (filterData['isSearchWallet']) {
        params['addressInContract'] = filterData?.keyWord;
      } else {
        params['query'] = 'wasm.token_id=' + filterData?.keyWord;
      }
    }

    return axios.get(`${this.indexerUrl}/transaction`, { params });
  }

  getListTokenNFTFromIndexer(payload): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      owner: payload.owner,
      tokenId: payload.token_id,
      contractAddress: payload.contractAddress,
      pageLimit: payload.pageLimit,
      pageOffset: payload.pageOffset,
      countTotal: true,
      contractType: 'CW721',
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

  getTokenMetrics({ range, coinId, maxDate }: { range: string; coinId: string; maxDate?: string }) {
    return this.http.get<any>(`${this.apiUrl}/metrics/token`, {
      params: maxDate
        ? {
            range,
            coinId,
            maxDate,
          }
        : {
            range,
            coinId,
          },
    });
  }
}
