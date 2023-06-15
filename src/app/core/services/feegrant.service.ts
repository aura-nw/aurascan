import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { LENGTH_CHARACTER } from '../constants/common.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';
import { map } from 'rxjs/operators';

@Injectable()
export class FeeGrantService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;
  indexerUrl = `${this.environmentService.configValue.indexerUri}`;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getListFeeGrants(filterSearch, currentAddress, nextKey = null, isGranter = false): Observable<any> {
    let granter;
    let grantee;
    let isSearchAddress = true;
    if (filterSearch['textSearch']?.length === LENGTH_CHARACTER.TRANSACTION) {
      isSearchAddress = false;
    }
    if (isGranter) {
      grantee = currentAddress;
      granter = isSearchAddress ? filterSearch['textSearch'] : null;
    } else {
      granter = currentAddress;
      grantee = isSearchAddress ? filterSearch['textSearch'] : null;
    }
    const params = _({
      chainid: this.chainInfo.chainId,
      granter: granter,
      grantee: grantee,
      status: filterSearch['isActive'] ? 'Available' : 'Use up,Revoked,Fail',
      pageLimit: 100,
      nextKey: nextKey,
      txhash: !isSearchAddress ? filterSearch['textSearch'] : null,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${this.indexerUrl}/feegrant/get-grants`, {
      params,
    });
  }

  getListFeeGrantsV2(payload, textSearch = ''): Observable<any> {
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

  checkAddressValid(granter, grantee) {
    const params = _({
      chainid: this.chainInfo.chainId,
      grantee: grantee,
      granter: granter,
      status: 'Available',
      pageLimit: 1,
      expired: true,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return axios.get(`${this.indexerUrl}/feegrant/get-grants`, { params });
  }
}
