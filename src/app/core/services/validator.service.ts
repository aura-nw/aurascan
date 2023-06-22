import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import * as _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { LCD_COSMOS } from '../constants/url.constant';
import { Globals } from 'src/app/global/global';
import { map, shareReplay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ValidatorService extends CommonService {
  apiUrl = `${this.environmentService.configValue.beUri}`;
  chainInfo = this.environmentService.configValue.chain_info;
  stakingAPRSubject: BehaviorSubject<number>;

  private cachedValidator$: Observable<
    [
      {
        image_url: string;
        operator_address: string;
      },
    ]
  >;

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
        supply = this.global.dataHeader.total_aura.toString().slice(0, -1);
        this.stakingAPRSubject.next((inflation * (1 - communityTax)) / (bonded_tokens / supply));
      }
    }, 500);
  }

  validators(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/validators`);
  }

  getListValidator() {
    const operationsDoc = `
    query getListValidator {
      ${this.envDB} {
        validator(order_by: {tokens: desc}) {
          description
          operator_address
          account_address
          consensus_hex_address
          percent_voting_power
          tokens
          jailed
          uptime
          status
          unbonding_height
          start_height
          unbonding_time
          consensus_pubkey
          delegator_shares
          commission
          self_delegation_balance
          min_self_delegation
          missed_blocks_counter
          vote_aggregate {
            aggregate {
              count
            }
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
        },
        operationName: 'getListValidator',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getDataValidator(payload) {
    const operationsDoc = `
    query auratestnet_validator($offset: Int = 0, $limit: Int = 10, $operatorAddress: String = null) {
      ${this.envDB} {
        validator(limit: $limit, offset: $offset, where: {operator_address: {_eq: $operatorAddress}}) {
          account_address
          commission
          consensus_address
          consensus_hex_address
          created_at
          consensus_pubkey
          delegator_shares
          delegators_count
          delegators_last_height
          description
          index_offset
          jailed
          jailed_until
          min_self_delegation
          missed_blocks_counter
          operator_address
          percent_voting_power
          self_delegation_balance
          start_height
          status
          tokens
          tombstoned
          unbonding_height
          unbonding_time
          uptime
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload?.limit || 1,
          offset: payload?.offset || 0,
          operatorAddress: payload?.operatorAddress || null,
        },
        operationName: 'auratestnet_validator',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  validatorsDetail(address: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/validators/${address}`);
  }

  validatorsDetailListPower(address: string, limit = 10, nextKey = null) {
    const operationsDoc = `
    query auratestnet_powerevent($operator_address: String, $limit: Int = 10, $nextKey: Int = null) {
      ${this.envDB} {
        power_event(order_by: {height: desc}, where: {_or: [{validatorDst: {operator_address: {_eq: $operator_address}}}, {validatorSrc: {operator_address: {_eq: $operator_address}}}], id: {_lt: $nextKey}}, limit: $limit) {
          id
          time
          height
          transaction {
            hash
          }
          type
          amount
          validatorSrc {
            operator_address
          }
          validatorDst {
            operator_address
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          operator_address: address,
          limit: limit,
          nextKey: nextKey,
        },
        operationName: 'auratestnet_powerevent',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  validatorsDetailWallet(address: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/validators/delegations/${address}`);
  }

  delegator(pageLimit = 100, address: string, nextKey = null) {
    return axios.get(
      `${this.chainInfo.rest}/${LCD_COSMOS.STAKING}/validators/${address}/delegations?pagination.limit=${pageLimit}&pagination.key=${nextKey}&pagination.reverse=true`,
    );
  }

  getValidatorAvatar(validatorAddress: string): string {
    return `${this.environmentService.configValue.validator_s3}/${validatorAddress}.png`;
  }

  getValidatorInfoByList(addressList: string[]): Observable<any> {
    // Cache validator info, only get on the first time
    if (!this.cachedValidator$) {
      this.cachedValidator$ = this.http
        .get<any>(`${this.apiUrl}/validators/validator-info?address=${addressList}`)
        .pipe(shareReplay(1));
    }

    return this.cachedValidator$;
  }

  getUptimeLCD(block = null) {
    if (!block) {
      block = 'latest';
    }
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.BLOCK}/${block}`);
  }

  getUptimeIndexer(consAddress = null, limit = 100, height = null) {
    const operationsDoc = `
    query MyQuery($cons_address: String, $limit: Int = 100, $height: Int = 0) {
      ${this.envDB} {
        block(order_by: {height: desc}, limit: $limit, where: {height: {_eq: $height}}) {
          height
          hash
          block_signatures(where: {validator_address: {_eq: $cons_address}}) {
            signature
            block_id_flag
            timestamp
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          cons_address: consAddress,
          limit: limit,
          height: height,
        },
        operationName: 'MyQuery',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListUndelegateLCD(address) {
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.STAKING}/delegators/${address}/unbonding_delegations`);
  }
}
