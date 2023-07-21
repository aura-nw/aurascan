import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { formatDistanceToNowStrict } from 'date-fns';
import * as moment from 'moment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DATEFORMAT } from '../constants/common.constant';
import { STATUS_VALIDATOR } from '../constants/validator.enum';
import { EnvironmentService } from '../data-services/environment.service';
import { formatTimeInWords, formatWithSchema } from '../helpers/date';
import { Globals } from 'src/app/global/global';

@Injectable()
export class CommonService {
  apiUrl = '';
  coins = this._environmentService.configValue.coins;
  private networkQuerySubject: BehaviorSubject<any>;
  public networkQueryOb: Observable<any>;
  chainInfo = this._environmentService.configValue.chain_info;
  horoscopeApi = `${
    this._environmentService.configValue.horoscopeUrl + this._environmentService.configValue.horoscopePathApi
  }`;
  graphUrl = `${
    this._environmentService.configValue.horoscopeUrl + this._environmentService.configValue.horoscopePathGraphql
  }`;
  envDB = this._environmentService.configValue.horoscopeSelectedChain;
  chainId = this._environmentService.configValue.chainId;
  listNameTag = [];

  constructor(private _http: HttpClient, private _environmentService: EnvironmentService) {
    this.apiUrl = `${this._environmentService.configValue.beUri}`;
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
    return this._http.get<any>(`${this.horoscopeApi}/dashboard-statistics?chainid=${this.chainId}`);
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
    return axios.get(`${this._environmentService.configValue.chain_info.rest}/cosmos/distribution/v1beta1/params`);
  }

  getDefaultImg() {
    return this._environmentService.configValue.image_s3 + 'images/aura__ntf-default-img.png';
  }

  getListNameTag(payload) {
    return this._http.post<any>(`${this.apiUrl}/name-tag/get-name-tag`, payload);
  }

  setNameTag(address, listNameTag = []) {
    this.listNameTag = this.listNameTag?.length > 0 ? this.listNameTag : listNameTag;
    const nameTag = this.listNameTag?.find((k) => k.address === address);
    return nameTag?.name_tag || address;
  }

  findNameTag(keySearch, listNameTag = []) {
    this.listNameTag = this.listNameTag?.length > 0 ? this.listNameTag : listNameTag;
    if (this.listNameTag?.length > 0) {
      const result = this.listNameTag?.find((k) => k.name_tag?.trim() === keySearch?.trim())?.address || '';
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
}
