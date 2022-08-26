import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { LCD_COSMOS } from '../constants/url.constant';
import axios from "axios";

@Injectable({
  providedIn: 'root',
})
export class ValidatorService extends CommonService {
  apiUrl = `${this.environmentService.configValue.beUri}`;
  chainInfo = this.environmentService.configValue.chain_info;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  validators(): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/validators`);
  }

  validatorsDetail(address: string): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/validators/${address}`);
  }

  validatorsDetailListPower(limit: string | number, offset: string | number, address: string): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/validators/events/${address}?limit=${limit}&offset=${offset}`);
  }

  validatorsDetailWallet(address: string): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/validators/delegations/${address}`);
  }

  validatorsListUndelegateWallet(address: string): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/validators/${address}/unbonding-delegations`);
  }

  validatorsListRedelegate(delegatorAddress: string, operatorAddress: string): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/validators/${operatorAddress}/${delegatorAddress}/delegators`);
  }

  delegators(limit: string | number, offset: string | number, address: string) {
    return axios.get(
      `${this.chainInfo.rest}/${LCD_COSMOS.STAKING}/validators/${address}/delegations?pagination.offset=${offset}&pagination.limit=${limit}&pagination.countTotal=true&pagination.reverse=true`,
    );
  }

  getSigningInfosByConsAddress(cons_address: string) {
    return axios.get(
      `${this.chainInfo.rest}/${LCD_COSMOS.SLASHING}/signing_infos/${cons_address}`,
    );
  }

  getValidatorAvatar(validatorAddress: string): string {
    return `${this.environmentService.configValue.validator_s3}/${validatorAddress}.png`;
  }
}
