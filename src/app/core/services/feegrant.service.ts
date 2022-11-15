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

  getListFeeGrants(textSearch, isGranter = false): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      granter: isGranter ? textSearch : null,
      grantee: !isGranter ? textSearch : null,
      pageLimit: 10,
      pageOffset: 0,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${this.indexerUrl}/feegrant/get-grants`, {
      params,
    });
  }
}
