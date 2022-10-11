import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { formatDistanceToNowStrict } from 'date-fns';
import * as _ from 'lodash';
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
  indexerUrl = `${this._environmentService.configValue.indexerUri}`;
  private networkQuerySubject: BehaviorSubject<any>;
  public networkQueryOb: Observable<any>;
  chainInfo = this._environmentService.configValue.chain_info;

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
    this.setURL();
    return this._http.get<any>(`${this.apiUrl}/status`);
  }

  getParamFromIndexer(){
    const params = _({
      chainid: this.chainInfo.chainId,
      module: 'gov'
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this._http.get<any>(`${this.indexerUrl}/param`, {
      params,
    });
  }

  setURL() {
    if (this.networkQuerySubject.value === 1) {
      this.apiUrl = `${this._environmentService.configValue.fabric}`;
    }
    if (this.networkQuerySubject.value === 2) {
      this.apiUrl = `${this._environmentService.configValue.beUri}`;
    }
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

  getValidatorImg(identity: string) {
    return axios.get(`https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${identity}&fields=pictures`);
  }

  mappingNameIBC(value) {
    let temp = value.slice(value.indexOf('ibc'));
    let result = this.coins.find((k) => k.denom === temp) || {};
    return result;
  }

  isValidatorJailed(jail, status){
    let result = jail && status === STATUS_VALIDATOR.Jail ? true : false;
    return result;
  }
}
