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

  getListFeeGrants2(
    {
      limit,
      hash,
      isGranter,
      granter,
      grantee,
      isActive,
      offset,
    }: {
      limit?: number;
      hash?: string;
      isGranter?: boolean;
      granter?: string;
      grantee?: string;
      isActive?: boolean;
      offset?: number;
    },
    textSearch = '',
  ): Observable<any> {
    if (textSearch?.length > 0) {
      if (textSearch?.length === LENGTH_CHARACTER.TRANSACTION) {
        hash = textSearch;
      } else {
        if (isGranter) {
          granter = textSearch;
        } else {
          grantee = textSearch;
        }
      }
    }

    let updateQuery = '';
    if (isActive) {
      updateQuery = ', status: {_eq: "Available"}';
    } else {
      updateQuery = ', status: {_neq: "Available"}';
    }

    const operationsDoc = `
    query queryFeegrant($limit: Int = 100,  $offset: Int = 0, $granter: String = null, $hash: String = null, $grantee: String = null) {
      ${this.envDB} {
        feegrant(limit: $limit, offset: $offset, where: {granter: {_eq: $granter}, transaction: {hash: {_eq: $hash}}, grantee: {_eq: $grantee} ${updateQuery} }, order_by: {init_tx_id: desc}) {
          grantee
          granter
          expiration
          type
          status
          spend_limit
          denom
          init_tx_id
          transaction {
            hash
            timestamp
          }
          revoke_tx {
            hash
          }
          feegrant_histories(where: {action: {_eq: "create"}}) {
            id
            amount
          }
        }
        feegrant_aggregate(where: {granter: {_eq: $granter}, transaction: {hash: {_eq: $hash}}, grantee: {_eq: $grantee} ${updateQuery} }) {
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
          limit: limit || 20,
          granter: granter || null,
          hash: hash || null,
          grantee: grantee || null,
          offset: offset || 0,
        },
        operationName: 'queryFeegrant',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}
