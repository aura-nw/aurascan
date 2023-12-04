import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { Globals } from 'src/app/global/global';
import { LCD_COSMOS } from '../constants/url.constant';

@Injectable({
  providedIn: 'root',
})
export class ValidatorService extends CommonService {
  chainInfo = this.environmentService.chainInfo;
  stakingAPRSubject: BehaviorSubject<number>;

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
    private global: Globals,
    private commonService: CommonService,
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

  getDataValidator(payload) {
    const operationsDoc = `
    query getDataValidator($offset: Int = 0, $limit: Int = 10, $operatorAddress: String = null) {
      ${this.envDB} {
        validator(limit: $limit, offset: $offset, order_by: {tokens: desc}, where: {operator_address: {_eq: $operatorAddress}, status: {_neq: "UNRECOGNIZED"}}) {
          account_address
          commission
          consensus_address
          consensus_hex_address
          description
          jailed
          missed_blocks_counter
          operator_address
          percent_voting_power
          self_delegation_balance
          start_height
          status
          tokens
          uptime
          image_url
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload?.limit || 200,
          offset: payload?.offset || 0,
          operatorAddress: payload?.operatorAddress || null,
        },
        operationName: 'getDataValidator',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListValidator(payload) {
    const operationsDoc = `
    query getListValidator($offset: Int = 0, $limit: Int = 10, $operatorAddress: String = null) {
      ${this.envDB} {
        validator(limit: $limit, offset: $offset, order_by: {tokens: desc}, where: {operator_address: {_eq: $operatorAddress}, status: {_neq: "UNRECOGNIZED"}}) {
          account_address
          commission
          consensus_address
          consensus_hex_address
          description
          jailed
          missed_blocks_counter
          operator_address
          percent_voting_power
          status
          tokens
          uptime
          image_url
          vote_aggregate {
            aggregate {
              count
            }
          }
        }
        validator_aggregate(where: {status: {_eq: "BOND_STATUS_BONDED"}}) {
          aggregate {
            count
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload?.limit || 200,
          offset: payload?.offset || 0,
          operatorAddress: payload?.operatorAddress || null,
        },
        operationName: 'getListValidator',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListNameValidator(payload) {
    const operationsDoc = `
    query getListNameValidator($offset: Int = 0, $limit: Int = 10, $operatorAddress: String = null) {
      ${this.envDB} {
        validator(limit: $limit, offset: $offset, order_by: {tokens: desc}, where: {operator_address: {_eq: $operatorAddress}, status: {_neq: "UNRECOGNIZED"}}) {
          account_address
          description
          operator_address
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload?.limit || 200,
          offset: payload?.offset || 0,
          operatorAddress: payload?.operatorAddress || null,
        },
        operationName: 'getListNameValidator',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  validatorsDetailListPower(address: string, limit = 10, nextKey = null) {
    const operationsDoc = `
    query validatorsDetailListPower($operator_address: String, $limit: Int = 10, $nextKey: Int = null) {
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
        operationName: 'validatorsDetailListPower',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  delegator(pageLimit = 100, address: string, nextKey = null) {
    return axios.get(
      `${this.chainInfo.rest}/${LCD_COSMOS.STAKING}/validators/${address}/delegations?pagination.limit=${pageLimit}&pagination.key=${nextKey}&pagination.reverse=true`,
    );
  }

  getUptimeLCD(block = null) {
    if (!block) {
      block = 'latest';
    }
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.BLOCK}/${block}`);
  }

  getUptimeIndexer(consAddress = null, limit = 100, height = null) {
    const operationsDoc = `
    query getUptimeIndexer($cons_address: String, $limit: Int = 100, $height: Int = 0) {
      ${this.envDB} {
        block(order_by: {height: desc}, limit: $limit, where: {height: {_eq: $height}}) {
          height
          hash
          block_signatures(where: {validator_address: {_eq: $cons_address}}) {
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
        operationName: 'getUptimeIndexer',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListUndelegateLCD(address) {
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.STAKING}/delegators/${address}/unbonding_delegations`);
  }

  getDelegationLCD(address) {
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.DELEGATION}/${address}`);
  }

  getRewardLCD(address) {
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.REWARD}/${address}/rewards`);
  }
}
