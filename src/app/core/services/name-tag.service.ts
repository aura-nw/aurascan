import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable({ providedIn: 'root' })
export class NameTagService extends CommonService {
  chainInfo = this.environmentService.chainInfo;
  listNameTag = [];

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getListPrivateNameTag(payload) {
    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();
    return this.http.get<any>(`${this.apiUrl}/user/private-name-tag`, {
      params,
    });
  }

  createPrivateName(payload) {
    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();
    return this.http.post<any>(`${this.apiUrl}/user/private-name-tag`, params);
  }

  deletePrivateNameTag(id) {
    return this.http.delete<any>(`${this.apiUrl}/user/private-name-tag/${id}`);
  }

  updatePrivateNameTag(payload) {
    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();
    return this.http.patch<any>(`${this.apiUrl}/user/private-name-tag/${payload.id}`, params);
  }

  getListNameTag(payload) {
    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();
    return this.http.get<any>(`${this.apiUrl}/public-name-tag`, {
      params,
    });
  }

  setNameTag(address, listNameTag = [], getPrivate = true) {
    this.listNameTag = this.listNameTag?.length > 0 ? this.listNameTag : listNameTag;
    const nameTag = this.listNameTag?.find((k) => k.address === address);
    let result = nameTag?.name_tag || address;
    if (getPrivate) {
      result = nameTag?.name_tag_private || result;
    }
    return result;
  }

  findNameTag(keySearch, listNameTag = []) {
    if(!keySearch){
      return '';
    }
    const userEmail = localStorage.getItem('userEmail');
    this.listNameTag = this.listNameTag?.length > 0 ? this.listNameTag : listNameTag;
    if (this.listNameTag?.length > 0) {
      let result;
      if (userEmail) {
        result = this.listNameTag?.find((k) => k.name_tag_private?.trim() === keySearch?.trim())?.address || '';
      }
      if (!result) {
        result = this.listNameTag?.find((k) => k.name_tag?.trim() === keySearch?.trim())?.address || '';
      }
      return result;
    }
  }

  findUrlNameTag(address) {
    let result = '';
    const nameTag = this.listNameTag?.find((k) => k.address === address);
    if (nameTag?.enterpriseUrl?.length > 0) {
      result = nameTag?.enterpriseUrl;
    }
    return result;
  }

  checkPublic(address, listNameTag = []): boolean {
    this.listNameTag = this.listNameTag?.length > 0 ? this.listNameTag : listNameTag;
    let result = false;
    const nameTag = this.listNameTag?.find((k) => k.address === address && k.name_tag?.length > 0);
    if (nameTag && nameTag?.name_tag !== address) {
      result = true;
    }
    return result;
  }

  checkPrivate(address): boolean {
    let result = false;
    const nameTag = this.listNameTag?.find((k) => k.address === address && k.isPrivate);
    if (nameTag?.name_tag_private) {
      result = true;
    }
    return result;
  }
}
