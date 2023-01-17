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
  apiUrl = `${this.environmentService.configValue.beUri}`;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
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

  getSBTDetail(tokenID): Observable<any> {
    const params = _(tokenID).omitBy(_.isNull).omitBy(_.isUndefined).value();
    return this.http.get<any>(`${this.apiUrl}/soulbound-token/tokens-detail/${tokenID}`);
  }

  createSBToken(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/soulbound-token`, payload);
  }

  updatePickSBToken(payload): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/soulbound-token`, payload);
  }
}
