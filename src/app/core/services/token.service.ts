import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { INDEXER_URL } from '../constants/common.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class TokenService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;
  prefixAdd = this.environmentService.configValue.chain_info.bech32Config.bech32PrefixAccAddr;
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
    filterData = '',
  ): Observable<any> {
    let url = `${INDEXER_URL}/transaction?chainid=${this.chainInfo.chainId}&pageOffset=${offset}&pageLimit=${limit}&countTotal=true&reverse=false&query=execute._contract_address%3D'${contractAddress}'`;
    if (filterData) {
      console.log(filterData);
      if (filterData.length > 60) {
        url += `&txHash=${filterData}`;
      } else if (filterData?.length >= 43 && filterData?.startsWith(this.prefixAdd)) {
        url += `&address=${filterData}`;
      } else {
        url += `%2C%20wasm.token_id%3D'${filterData}'`;
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
