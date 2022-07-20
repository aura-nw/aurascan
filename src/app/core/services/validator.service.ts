import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VALIDATOR_AVATAR_DF } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import axios from "axios";

@Injectable({
  providedIn: 'root'
})
export class ValidatorService extends CommonService {
  apiUrl = `${this.environmentService.configValue.beUri}`;

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
    return axios.get('https://lcd.dev.aura.network/cosmos/staking/v1beta1/validators/auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh/delegations?pagination.offset=0&pagination.limit=5&pagination.countTotal=true&pagination.reverse=true');
  }

  getValidatorAvatar(validatorAddress: string): string {
    return `${this.environmentService.configValue.validator_s3}/${validatorAddress}.png`;
  }
}
