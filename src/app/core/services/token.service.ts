import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { INDEXER_URL, LENGTH_CHARACTER } from '../constants/common.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class TokenService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;
  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getListToken(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cw20-tokens`, payload);
  }

  getListCW721Token(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cw721-tokens`, payload);
  }

  getTokenCW20Detail(address): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cw20-tokens/${address}`);
  }

  getTokenCW721Detail(address): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cw721-tokens/${address}`);
  }

  getListTokenTransfer(
    limit: string | number,
    offset: string | number,
    contractAddress: string,
    filterData: any,
    mode = '',
  ): Observable<any> {
    let url = `${INDEXER_URL}/transaction?chainid=${this.chainInfo.chainId}&pageOffset=${offset}&pageLimit=${limit}&countTotal=true&reverse=false&query=execute._contract_address%3D'${contractAddress}'`;
    if (filterData?.keyWord) {
      if (filterData?.keyWord.length > LENGTH_CHARACTER.TRANSACTION) {
        url += `&txHash=${filterData?.keyWord}`;
      } else if (filterData['isSearchWallet']) {
        url += `%2Cwasm.${mode}%3D'${filterData?.keyWord}'`;
      } else {
        url += `%2Cwasm.token_id%3D'${filterData?.keyWord}'`;
      }
    }
    return this.http.get<any>(url);
  }

  getListTokenNFT(contractAddress: string, payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cw721-tokens/${contractAddress}/nfts`, payload);
  }

  getListTokenHolder(
    limit: string | number,
    offset: string | number,
    contractType: string,
    contractAddress: string,
  ): Observable<any> {
    let url = `${INDEXER_URL}/asset/holder?chainid=${this.chainInfo.chainId}&contractType=${contractType}&contractAddress=${contractAddress}&pageOffset=${offset}&pageLimit=${limit}&countTotal=true`;
    return this.http.get<any>(url);
  }

  getContractDetail(tokenAddress): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/contracts/${tokenAddress}`);
  }

  getNFTDetail(contractAddress: string, tokenId): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cw721-tokens/${contractAddress}/nft/${tokenId}`);
  }
}
