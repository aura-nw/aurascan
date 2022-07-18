import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VALIDATOR_AVATAR_DF } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { LCD_COSMOS } from '../constants/url.constant';

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

  delegators(limit: string | number, offset: string | number, address: string): Observable<any> {
    this.setURL();
    // return this.http.get<any>(
    //   `${this.apiUrl}/validators/${address}/delegator-by-validator-addr?limit=${limit}&offset=${offset}`,
    // );
    const headerDict = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Credentials': 'true',
      'cf-cache-status': 'DYNAMIC',
      'content-encoding': 'br',
      'expect-ct': 'max-age=604800,report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"',
      'nel': '{"success_fraction":0,"report_to":"cf-nel","max_age":604800}',
      'server': 'cloudflare',
      'x-server-time': '1658109165',
      'customer-header': 'custom'
    };

    const requestOptions = {
      headers: new Headers(headerDict),
    };

    console.log(
      `${this.chainInfo.rest}/${LCD_COSMOS.STAKING}/validators/${address}/delegations?pagination.offset=${offset}&pagination.limit=${limit}&pagination.reverse=true`,
    );

    // return this.http.get<any>(
    //   `${this.chainInfo.rest}/${LCD_COSMOS.STAKING}/validators/${address}/delegations?pagination.offset=${offset}&pagination.limit=${limit}&pagination.reverse=true`,
    //   requestOptions,
    // );

    let url = 'https://lcd.dev.aura.network/cosmos/staking/v1beta1/validators/auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh/delegations';

    return this.http.get(
      url,
      { headers: new HttpHeaders(headerDict) },
    );
  }

  getValidatorAvatar(validatorAddress: string): string {
    return `${this.environmentService.configValue.validator_s3}/${validatorAddress}.png`;
  }
}
