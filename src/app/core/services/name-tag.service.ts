import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';
import { UserService } from './user.service';
import { transferAddress } from '../utils/common/address-converter';
import local from '../utils/storage/local';
import { STORAGE_KEYS } from '../constants/common.constant';

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
    const nameTag = this.findNameTag(address);

    let result = isPrivate && nameTag?.name_tag_private ? nameTag?.name_tag_private : nameTag?.name_tag;

    return result ? result : address;
  }

  findAddressByNameTag(nameTag: string, findEvmAddr = false) {
    if (!nameTag) {
      return '';
    }

    const userEmail = this.userService.getCurrentUser()?.email;

    let address = '';
    if (this.listNameTag?.length > 0) {
      let tag: any = {};
      if (userEmail) {
        tag = this.listNameTag?.find((k) => k.name_tag_private?.trim() === nameTag?.trim());
      }

      if (!address) {
        tag = this.listNameTag?.find((k) => k.name_tag?.trim() === nameTag?.trim());
      }

      if (nameTag) {
        address = findEvmAddr ? tag?.evm_address : tag?.address;
      }
    }
    return address;
  }

  findUrlByAddress(address: string) {
    let result = '';
    const nameTag = this.findNameTag(address);
    if (nameTag?.enterpriseUrl?.length > 0) {
      result = nameTag?.enterpriseUrl;
    }
    return result;
  }

  isPublic(address: string): boolean {
    const nameTag = this.findNameTag(address);
    return !!nameTag['name_tag'];
  }

  isPrivate(address: string): boolean {
    const nameTag = this.findNameTag(address);
    return !!(nameTag?.isPrivate && nameTag?.name_tag_private);
  }

  checkDisplayTooltip(address: string): boolean {
    const nameTag = this.findNameTag(address);
    return !nameTag || nameTag?.name_tag === address;
  }

  findNameTag(address) {
    if (this.listNameTag?.length === 0) {
      this.listNameTag = local.getItem<[]>(STORAGE_KEYS.LIST_NAME_TAG);
    }

    const { accountAddress, accountEvmAddress } = transferAddress(
      this.chainInfo.bech32Config.bech32PrefixAccAddr,
      address,
    );
    const nameTag = this.listNameTag?.find((k) => k.address === accountAddress || k.address === accountEvmAddress);
    return nameTag;
  }
}
