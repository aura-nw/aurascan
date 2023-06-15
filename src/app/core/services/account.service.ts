import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';
import { map } from 'rxjs/operators';
import { TYPE_CW4973 } from '../constants/contract.constant';

@Injectable()
export class AccountService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getAccountDetail(account_id: string | number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/account/${account_id}`);
  }

  getAssetCW20ByOwner(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cw20-tokens/get-by-owner/`, payload);
  }

  getAssetCW721ByOwner(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cw721-tokens/get-by-owner/`, payload);
  }

  getAssetCW721ByOwnerV2(payload): Observable<any> {
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
              smart_contract: { address: { _eq: $contract_address }, name: {_neq: "${TYPE_CW4973}"} }
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
          cw721_contract {
            name
            symbol
            smart_contract {
              name
              address
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
          limit: payload?.limit || 20,
          contract_address: payload?.contractAddress,
          nextKeyLastUpdatedHeight: payload?.nextKey,
          nextKeyId: payload?.nextKeyId,
          tokenId: payload?.token_id,
          owner: payload?.owner,
        },
        operationName: 'Query',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getTotalAssets(account_id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cw20-tokens/total-asset/${account_id}`);
  }
}
