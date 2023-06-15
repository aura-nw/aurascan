import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LENGTH_CHARACTER } from '../constants/common.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class FeeGrantService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getListFeeGrants(payload, textSearch = ''): Observable<any> {
    if (textSearch?.length > 0) {
      if (textSearch?.length === LENGTH_CHARACTER.TRANSACTION) {
        payload.hash = textSearch;
      } else {
        if (payload.isGranter) {
          payload.granter = textSearch;
        } else {
          payload.grantee = textSearch;
        }
      }
    }

    let updateQuery = '';
    if (payload.isActive) {
      updateQuery = ', status: {_eq: "Available"}';
    } else {
      updateQuery = ', status: {_neq: "Available"}';
    }

    const operationsDoc = `
    query auratestnet_feegrant($limit: Int = 100, $granter: String = null, $hash: String = null, $grantee: String = null) {
      ${this.envDB} {
        feegrant(limit: $limit, where: {granter: {_eq: $granter}, transaction: {hash: {_eq: $hash}}, grantee: {_eq: $grantee} ${updateQuery} }, order_by: {init_tx_id: desc}) {
          grantee
          granter
          expiration
          type
          status
          spend_limit
          transaction {
            hash
            timestamp
          }
          denom
          init_tx_id
          revoke_tx {
            hash
          }
          feegrant_histories(where: {action: {_eq: "create"}}) {
            id
            amount
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload?.limit || 100,
          granter: payload?.granter || null,
          hash: payload?.hash || null,
          grantee: payload?.grantee || null,
        },
        operationName: 'auratestnet_feegrant',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}
