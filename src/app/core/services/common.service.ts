import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { formatDistanceToNowStrict } from 'date-fns';
import * as _ from 'lodash';
import * as moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { DATEFORMAT } from '../constants/common.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { formatTimeInWords, formatWithSchema } from '../helpers/date';

@Injectable({ providedIn: 'root' })
export class CommonService {
  apiUrl = '';
  coins = this._environmentService.coins;
  private networkQuerySubject: BehaviorSubject<any>;
  public networkQueryOb: Observable<any>;
  chainInfo = this._environmentService.chainInfo;

  horoscope = this._environmentService.horoscope;
  horoscopeApi = this.horoscope?.url + this.horoscope?.rest;
  graphUrl = this.horoscope?.url + this.horoscope?.graphql;
  envDB = this.horoscope?.chain;

  chainId = this._environmentService.chainId;
  listNameTag = [];
  listValidator = [];

  constructor(private _http: HttpClient, private _environmentService: EnvironmentService) {
    this.apiUrl = `${this._environmentService.backend}`;
    const currentNetwork = JSON.parse(localStorage.getItem('currentNetwork'));
    this.networkQuerySubject = new BehaviorSubject<any>(currentNetwork?.value || 2);
    this.networkQueryOb = this.networkQuerySubject.asObservable();
  }

  public get getNetwork(): any {
    return this.networkQuerySubject.value;
  }

  public set setNetwork(data: any) {
    this.networkQuerySubject.next(data);
  }

  status(): Observable<any> {
    return this._http.get<any>(`${this.horoscopeApi}/statistics/dashboard?chainid=${this.chainId}`);
  }

  getParamTallyingFromLCD() {
    return axios.get(`${this.chainInfo.rest}/cosmos/gov/v1beta1/params/tallying`);
  }

  getAccountDistribution() {
    return axios.get(`${this.chainInfo.rest}/cosmos/auth/v1beta1/module_accounts/distribution`);
  }

  getDateValue(time, isCustom = true) {
    if (time) {
      try {
        //get custom function format date if isCustom
        if (isCustom) {
          return [
            formatTimeInWords(new Date(time).getTime()),
            `(${formatWithSchema(new Date(time).getTime(), DATEFORMAT.DATETIME_UTC)})`,
          ];
        } else {
          if (+moment(time).format('x') - +moment().format('x') > 0) {
            return [
              formatWithSchema(new Date(time).getTime(), DATEFORMAT.DATETIME_UTC),
              formatDistanceToNowStrict(new Date(time).getTime()) + ' remaining',
            ];
          } else {
            return [
              formatTimeInWords(new Date(time).getTime()),
              `${formatWithSchema(new Date(time).getTime(), DATEFORMAT.DATETIME_UTC)}`,
            ];
          }
        }
      } catch (e) {
        return [time, ''];
      }
    } else {
      return ['-', ''];
    }
  }

  mappingNameIBC(value) {
    let result = {};
    if (value.indexOf('ibc') >= 0) {
      try {
        if (!value.startsWith('ibc')) {
          let temp = value?.match(/\d+/g)[0];
          value = value?.replace(temp, '');
        }
      } catch {}
      result = { display: value, decimals: 6 };
      let temp = value.slice(value.indexOf('ibc'));
      result = this.coins.find((k) => k.denom === temp) || {};
      result['display'] = result['display'] || value;
    } else {
      result = { display: this.chainInfo.currencies[0].coinDenom, decimals: 6 };
    }
    return result;
  }

  getCommunityTax() {
    return axios.get(`${this._environmentService.chainInfo.rest}/cosmos/distribution/v1beta1/params`);
  }

  getDefaultImg() {
    return this._environmentService.imageUrl + 'images/aura__ntf-default-img.png';
  }

  getListNameTag(payload) {
    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();
    return this._http.get<any>(`${this.apiUrl}/public-name-tag`, {
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

  checkDisplayTooltip(address): boolean {
    let result = false;
    const nameTag = this.listNameTag?.find((k) => k.address === address);
    if (!nameTag || nameTag?.name_tag === address) {
      result = true;
    }
    return result;
  }

  showToolTip(element) {
    if (element.classList.contains('disabled-hover')) {
      element.classList.remove('disabled-hover');
      element.classList.add('show');
      setTimeout(function () {
        element.classList.remove('show');
        element.classList.add('disabled-hover');
      }, 800);
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
    if (!nameTag || nameTag?.name_tag === address) {
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

  exportCSV(payload, getPrivate = false): Observable<any> {
    const headers = new HttpHeaders().append('recaptcha', payload.responseCaptcha);
    const options = {
      responseType: 'blob' as 'json',
      headers,
    };
    const privateUrl = getPrivate ? '/private-name-tag' : '';

    return this._http.get<any>(
      `${this.apiUrl}/export-csv${privateUrl}?dataType=${payload.dataType}&address=${payload.address}&dataRangeType=${payload.dataRangeType}&min=${payload.min}&max=${payload.max}`,
      options,
    );
  }
}
