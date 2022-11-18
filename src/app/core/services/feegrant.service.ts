import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
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
    if (isGranter) {
      grantee = currentAddress;
      granter = filterSearch['textSearch'];
    } else {
      granter = currentAddress;
      grantee = filterSearch['textSearch'];
    }
    const params = _({
      chainid: this.chainInfo.chainId,
      granter: granter,
      grantee: grantee,
      status: 'Available',
      pageLimit: 100,
      nextKey: nextKey,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    let urlLink = filterSearch['isActive'] ? 'get-grants' : 'get-grants-inactive';
    return this.http.get<any>(`${this.indexerUrl}/feegrant/${urlLink}`, {
      params,
    });
  }
}
