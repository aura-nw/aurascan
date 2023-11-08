import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable({ providedIn: 'root' })
export class WatchListService extends CommonService {
  chainInfo = this.environmentService.chainInfo;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getListWatchList(payload) {
    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();
    return this.http.get<any>(`${this.apiUrl}/watch-list`, {
      params,
    });
  }

  createWatchList(payload) {
    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();
    return this.http.post<any>(`${this.apiUrl}/watch-list`, params);
  }

  deleteWatchList(id) {
    return this.http.delete<any>(`${this.apiUrl}/watch-list/${id}`);
  }

  updateWatchList(payload) {
    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();
    return this.http.patch<any>(`${this.apiUrl}/watch-list/${payload.id}`, params);
  }

  getDetailWatchList(id) {
    return this.http.get<any>(`${this.apiUrl}/watch-list/${id}`);
  }

}
