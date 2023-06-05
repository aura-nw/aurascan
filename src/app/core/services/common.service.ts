import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { formatDistanceToNowStrict } from 'date-fns';
import * as moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { DATEFORMAT } from '../constants/common.constant';
import { STATUS_VALIDATOR } from '../constants/validator.enum';
import { EnvironmentService } from '../data-services/environment.service';
import { formatTimeInWords, formatWithSchema } from '../helpers/date';

@Injectable()
export class CommonService {
  apiUrl = '';
  coins = this._environmentService.configValue.coins;
  private networkQuerySubject: BehaviorSubject<any>;
  public networkQueryOb: Observable<any>;
  chainInfo = this._environmentService.configValue.chain_info;
  graphUrl = `${this._environmentService.configValue.graphUrl}`;

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
    let api_link= this.graphUrl.replace('v1/graphql','api/v1');
    return this._http.get<any>(`${api_link}/dashboard-statistics`);
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
    let result = {display: value, decimals: 6};
    if (value.indexOf('ibc') >= 0) {
      let temp = value.slice(value.indexOf('ibc'));
      result = this.coins.find((k) => k.denom === temp);
    } else {
      result = {display: this.chainInfo.currencies[0].coinDenom, decimals: 6};
    }
    return result;
  }

  isValidatorJailed(jail, status) {
    let result = jail && status === STATUS_VALIDATOR.Jail ? true : false;
    return result;
  }

  getCommunityTax() {
    return axios.get(`${this._environmentService.configValue.chain_info.rest}/cosmos/distribution/v1beta1/params`);
  }

  getTokenByCoinId(range: string, id: string) {
    return this._http.get<any>(`${this.apiUrl}/metrics/token?range=${range}&coidId=${id}`);
  }

  getDefaultImg() {
    return this._environmentService.configValue.image_s3 + 'images/aura__ntf-default-img.png';
  }
}
