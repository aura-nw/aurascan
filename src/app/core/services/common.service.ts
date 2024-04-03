import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { formatDistanceToNowStrict } from 'date-fns';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { DATEFORMAT, STORAGE_KEYS } from '../constants/common.constant';
import { LCD_COSMOS } from '../constants/url.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { formatTimeInWords, formatWithSchema } from '../helpers/date';
import { isAddress, isContract, isEvmAddress, isValidBench32Address } from '../utils/common/validation';
import local from '../utils/storage/local';

@Injectable({ providedIn: 'root' })
export class CommonService {
  apiUrl = '';
  chainInfo = this._environmentService.chainInfo;

  horoscope = this._environmentService.horoscope;
  horoscopeApi = this.horoscope?.url + this.horoscope?.rest;
  graphUrl = this.horoscope?.url + this.horoscope?.graphql;
  envDB = this.horoscope?.chain;

  chainId = this._environmentService.chainId;
  addressPrefix = '';
  listValidator = [];

  constructor(
    private _http: HttpClient,
    private _environmentService: EnvironmentService,
  ) {
    this._environmentService.config.asObservable().subscribe((res) => {
      this.apiUrl = res.api.backend;
      this.addressPrefix = res.chainConfig.chain_info.bech32Config.bech32PrefixAccAddr;
    });
  }

  status(): Observable<any> {
    return this._http.get<any>(`${this.horoscopeApi}/statistics/dashboard?chainid=${this.chainId}`);
  }

  getParamTallyingFromLCD() {
    return axios.get(`${this.chainInfo.rest}/cosmos/gov/v1beta1/params/tallying`);
  }

  getAccountDistribution() {
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.MODULE_ACCOUNTS}/distribution`);
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
    const listTokenIBC = local.getItem<any>(STORAGE_KEYS.LIST_TOKEN_IBC);
    let result = {
      display: this.chainInfo.currencies[0].coinDenom,
      decimals: this.chainInfo.currencies[0].coinDecimals,
    };
    if (value.indexOf('ibc') >= 0) {
      try {
        if (!value.startsWith('ibc')) {
          let temp = value?.match(/\d+/g)[0];
          value = value?.replace(temp, '');
        }
      } catch {}
      let temp = value.slice(value.indexOf('ibc'));
      result = listTokenIBC?.find((k) => k.denom === temp) || {
        display: value,
        symbol: value,
      };
      result['decimals'] = result['decimal'] || result['decimals'] || this.chainInfo.currencies[0].coinDecimals;
    }

    return result;
  }

  getCommunityTax() {
    return axios.get(`${this._environmentService.chainInfo.rest}/cosmos/distribution/v1beta1/params`);
  }

  getDefaultImg() {
    return this._environmentService.imageUrl + 'images/aura__ntf-default-img.png';
  }

  getOffSet(el) {
    // calculate tooltip position
    // param el: tooltip element's parent
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX + rect.width / 2,
      top: rect.top,
    };
  }

  exportCSV(payload, getPrivate = false): Observable<any> {
    const headers = new HttpHeaders().append('recaptcha', payload.responseCaptcha);
    const options = {
      responseType: 'blob' as 'json',
      headers,
    };
    const privateUrl = getPrivate ? '/private-name-tag' : '';

    return this._http.get<any>(
      `${this.apiUrl}/export-csv${privateUrl}?dataType=${payload.dataType}&address=${payload.address}&evmAddress=${payload.evmAddress}&dataRangeType=${payload.dataRangeType}&min=${payload.min}&max=${payload.max}`,
      options,
    );
  }

  replaceImgIpfs(value) {
    if (value.match(/^https?:/)) {
      return value;
    }
    return this._environmentService.ipfsDomain + value.replace('://', '/');
  }

  isValidContract(address: string) {
    return isContract(address, this.chainInfo.bech32Config.bech32PrefixAccAddr);
  }

  isValidAddress(address: string) {
    return isAddress(address, this.chainInfo.bech32Config.bech32PrefixAccAddr);
  }

  isValidEvmAddress(address: string) {
    return isEvmAddress(address);
  }

  isBech32Address(address: string) {
    return isValidBench32Address(address, this.chainInfo.bech32Config.bech32PrefixAccAddr);
  }

  getRawData(url): Observable<any> {
    return this._http.get<any>(url);
  }
}
