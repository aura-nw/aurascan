import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class NameTagService extends CommonService {
  chainInfo = this.environmentService.chainInfo;
  listNameTag = [];

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
    private userService: UserService,
  ) {
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

  findNameTagByAddress(address: string, isPrivate = true) {
    const nameTag = this.listNameTag?.find((k) => k.address === address);

    let result = isPrivate && nameTag?.name_tag_private ? nameTag?.name_tag_private : nameTag?.name_tag;

    return result ? result : address;
  }

  findAddressByNameTag(nameTag: string) {
    if (!nameTag) {
      return '';
    }

    const userEmail = this.userService.getCurrentUser()?.email;
    let address = '';
    if (this.listNameTag?.length > 0) {
      if (userEmail) {
        address = this.listNameTag?.find((k) => k.name_tag_private?.trim() === nameTag?.trim())?.address || '';
      }

      if (!address) {
        address = this.listNameTag?.find((k) => k.name_tag?.trim() === nameTag?.trim())?.address || '';
      }
    }
    return address;
  }

  findUrlByAddress(address: string) {
    let result = '';
    const nameTag = this.listNameTag?.find((k) => k.address === address);
    if (nameTag?.enterpriseUrl?.length > 0) {
      result = nameTag?.enterpriseUrl;
    }
    return result;
  }

  isPublic(address: string): boolean {
    const nameTag = this.listNameTag?.find((k) => k.address === address);

    if (nameTag?.name_tag) {
      return true;
    }

    return false;
  }

  isPrivate(address: string): boolean {
    const nameTag = this.listNameTag?.find((k) => k.address === address);

    if (nameTag?.isPrivate && nameTag?.name_tag_private) {
      return true;
    }

    return false;
  }

  checkDisplayTooltip(address: string): boolean {
    const nameTag = this.listNameTag?.find((k) => k.address === address);

    if (!nameTag || nameTag?.name_tag === address) {
      return true;
    }
    return false;
  }
}
