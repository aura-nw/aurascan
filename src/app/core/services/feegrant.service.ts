import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { LENGTH_CHARACTER } from '../constants/common.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

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
      status: 'Available',
      pageLimit: 100,
      nextKey: nextKey,
      txhash: !isSearchAddress ? filterSearch['textSearch'] : null,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    let urlLink = filterSearch['isActive'] ? 'get-grants' : 'get-grants-inactive';
    return this.http.get<any>(`${this.indexerUrl}/feegrant/${urlLink}`, {
      params,
    });
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
