import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import * as _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { LCD_COSMOS } from '../constants/url.constant';
import { Globals } from 'src/app/global/global';
import { checkEnvQuery } from '../utils/common/info-common';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ValidatorService extends CommonService {
  apiUrl = `${this.environmentService.configValue.beUri}`;
  chainInfo = this.environmentService.configValue.chain_info;
  indexerUrl = `${this.environmentService.configValue.indexerUri}`;
  graphUrl = `${this.environmentService.configValue.graphUrl}`;
  envDB = checkEnvQuery(this.environmentService.configValue.env);
  stakingAPRSubject: BehaviorSubject<number>;

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
    private global: Globals,
    public commonService: CommonService,
  ) {
    super(http, environmentService);
    this.stakingAPRSubject = new BehaviorSubject<number>(0);
    this.setStakingAPR().then((r) => {});
  }
  async setStakingAPR() {
    const communityTaxRq = await this.commonService.getCommunityTax();
    const communityTax = communityTaxRq?.data?.params?.community_tax;
    let inflation;
    let bonded_tokens;
    let supply;
    setInterval(() => {
      if (!inflation && !bonded_tokens && !supply) {
        inflation = this.global.dataHeader.inflation.slice(0, -1);
        bonded_tokens = this.global.dataHeader.bonded_tokens.toString().slice(0, -1);
        supply = this.global.dataHeader.supply.toString().slice(0, -1);
        this.stakingAPRSubject.next((inflation * (1 - communityTax)) / (bonded_tokens / supply));
      }
    }, 500);
  }

  validators(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/validators`);
  }

  validatorsFromIndexer(address: string): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      operatorAddress: address,
      pageLimit: 100,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${this.indexerUrl}/validator`, {
      params,
    });
  }

  validatorsDetail(address: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/validators/${address}`);
  }

  validatorsDetailListPower(address: string, limit = 10, nextKey = null) {
    let filterQuery = '';
    if (nextKey) {
      filterQuery = ', id: {_lt: ' + `${nextKey}` + '}';
    }
    const operationsDoc = `
    query getListPower($type: [String]) {
      ${this.envDB} {
        transaction(limit: ${limit}, order_by: {timestamp: desc}, where: {events: {event_attributes: {key: {_in: ["validator", "destination_validator"]}, value: {_eq: "${address}" }}}, transaction_messages: {type: {_in: $type}} ${filterQuery} }) {
          id
          hash
          height
          timestamp
          data(path: "tx")
          power_events {
            amount
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          type: ["/cosmos.staking.v1beta1.MsgDelegate","/cosmos.staking.v1beta1.MsgUndelegate","/cosmos.staking.v1beta1.MsgBeginRedelegate"]
        },
        operationName: 'getListPower',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  validatorsDetailListPowerOld(address: string, pageLimit = 10, nextKey = null): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      address,
      pageLimit,
      nextKey,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${this.indexerUrl}/transaction/power-event`, {
      params,
    });
  }

  validatorsDetailWallet(address: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/validators/delegations/${address}`);
  }

  validatorsListUndelegateWallet(address: string): Observable<any> {
    return this.http.get<any>(
      `${this.indexerUrl}/account-unbonds?chainid=${this.chainInfo.chainId}&address=${address}`,
    );
  }

  delegators(pageLimit = 100, address: string,  nextKey = null) {
    return axios.get(
      `${this.chainInfo.rest}/${LCD_COSMOS.STAKING}/validators/${address}/delegations?pagination.limit=${pageLimit}&pagination.key=${nextKey}&pagination.reverse=true`,
    );
  }

  getValidatorAvatar(validatorAddress: string): string {
    return `${this.environmentService.configValue.validator_s3}/${validatorAddress}.png`;
  }

  getValidatorInfoByList(addressList: string[]): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/validators/validator-info?address=${addressList}`);
  }

  getStakeInfo(delegatorAddress: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/validators/delegations/delegator/${delegatorAddress}`);
  }

  getUptimeLCD(block = null) {
    if (!block) {
      block = 'latest';
    }
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.BLOCK}/${block}`);
  }
}
