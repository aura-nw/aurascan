import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SoulboundService extends CommonService {
  apiUrl = `${this.environmentService.backend}`;

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
    private commonService: CommonService,
  ) {
    super(http, environmentService);
  }

  getListSoulbound(payload): Observable<any> {
    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();

    return this.http.get<any>(`${this.apiUrl}/soulbound-token/contracts`, {
      params,
    });
  }

  getSBContractDetail(payload): Observable<any> {
    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();

    return this.http.get<any>(`${this.apiUrl}/soulbound-token/tokens`, {
      params,
    });
  }

  getListSoulboundByAddress(payload): Observable<any> {
    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();

    return this.http.get<any>(`${this.apiUrl}/soulbound-token/tokens-receiver-address`, {
      params,
    });
  }

  pickSBToken(payload): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/soulbound-token/picked-nft`, payload);
  }

  getSBTPick(payload): Observable<any> {
    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();

    return this.http.get<any>(`${this.apiUrl}/soulbound-token/tokens-picked`, {
      params,
    });
  }

  createSBToken(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/soulbound-token`, payload);
  }

  updatePickSBToken(payload): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/soulbound-token`, payload);
  }

  getListABT(payload): Observable<any> {
    let queryUpdate = '';
    if (this.commonService.isValidContract(payload.keyword)) {
      queryUpdate = 'address: {_eq:' + payload.keyword + '}';
    } else if (this.commonService.isValidAddress(payload.keyword)) {
      queryUpdate = 'creator: {_eq: ' + payload.keyword + '}';
    } else if (payload.keyword?.length > 0) {
      payload.keyword = `"%` + payload.keyword + `%"`;
      queryUpdate = 'name: {_ilike: ' + payload.keyword + '}';
    }
    const operationsDoc = `
    query queryCW4973ListToken(
      $limit: Int, 
      $offset: Int
    ) {
      ${this.envDB} { 
        cw721_contract(
          limit: $limit, 
          where: {
            smart_contract: {
              name: {_eq: "crates.io:cw4973"},
              ${queryUpdate}
            }, 
          },
          offset: $offset,
          order_by: {updated_at: desc}
        ) { 
          name
          symbol
          smart_contract {
            address
            name
            creator
          }
        } 
        cw721_contract_aggregate(
          where: {
            smart_contract: {
              name: {_eq: "crates.io:cw4973"},
              ${queryUpdate}
            }, 
          }) {
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
          limit: payload.limit,
          offset: payload.offset,
        },
        operationName: 'queryCW4973ListToken',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  updateNotify(contractAddress: string, tokenId): Observable<any> {
    const payload = {
      tokenId: tokenId,
      contractAddress: contractAddress,
    };
    return this.http.put<any>(`${this.apiUrl}/soulbound-token/update-notify`, payload);
  }

  rejectABT(payload): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/soulbound-token/reject-token`, payload);
  }

  getListWL(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/soulbound-token/white-list`);
  }

  checkReject(receiveAddress, minterAddress): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/soulbound-token/check-reject/${receiveAddress}/${minterAddress}`);
  }

  getNotify(receiveAddress): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/soulbound-token/notify/${receiveAddress}`);
  }

  countTotalABT(receiveAddress): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/soulbound-token/count/${receiveAddress}`);
  }
}
