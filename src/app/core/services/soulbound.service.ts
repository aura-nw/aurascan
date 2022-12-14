import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class SoulboundService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;
  indexerUrl = `${this.environmentService.configValue.indexerUri}`;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getListSoulbound(payload): Observable<any> {
    // const params = _({
    //   limit: 100,
    //   offset: 0,
    //   minterAddress: 'aura1uh24g2lc8hvvkaaf7awz25lrh5fptthu2dhq0n',
    //   keyword: '',
    // })
    //   .omitBy(_.isNull)
    //   .omitBy(_.isUndefined)
    //   .value();

    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();

    return this.http.get<any>(`http://10.9.0.57:3000/api/v1/soulbound-token/contracts`, {
      params,
    });

    // return this.http.get<any>(`${this.indexerUrl}/soulbound-token/contracts`, {
    //   params,
    // });
  }

  getSBContractDetail(payload): Observable<any> {
    const params = _({
      limit: 100,
      offset: 0,
      minterAddress: 'aura1uh24g2lc8hvvkaaf7awz25lrh5fptthu2dhq0n',
      contractAddress: 'aura19jyqpvxezm5m3hmm8l0xgz3ytkfgjyv0d2xadfq0qgrmd3fyhdksylg5c0',
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`http://10.9.0.57:3000/api/v1/soulbound-token/tokens`, {
      params,
    });

    // return this.http.get<any>(`${this.indexerUrl}/soulbound-token/contracts`, {
    //   params,
    // });
  }
}
