import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { LCD_COSMOS } from '../constants/url.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class ProposalService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;
  indexerUrl = `${this.environmentService.configValue.indexerUri}`;
  reloadList$ = new Subject();

  reloadList() {
    this.reloadList$.next(true)
  }

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getVotes(proposalId: string | number, voter: string, limit: string | number, offset: string | number) {
    return axios.get(
      `${this.chainInfo.rest}/${LCD_COSMOS.TX}/txs?events=proposal_vote.proposal_id%3D%27${proposalId}%27&events=transfer.sender%3D%27${voter}%27&pagination.offset=${offset}&pagination.limit=${limit}&order_by=ORDER_BY_DESC`,
    );
  }

  getValidatorVotesFromIndexer(proposalid): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      proposalid: proposalid
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${this.indexerUrl}/votes/validators`, {
      params,
    });
  }

  getDepositors(proposalId: string | number) {
    return axios.get(
      `${this.chainInfo.rest}/${LCD_COSMOS.TX}/txs?events=proposal_deposit.proposal_id%3D%27${proposalId}%27&order_by=ORDER_BY_DESC`,
    );
  }

  getListVoteFromIndexer(payload, option): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      nextKey: payload.nextKey,
      reverse: false,
      pageLimit: payload.pageLimit,
      answer: option,
      proposalid: payload.proposalid 
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${this.indexerUrl}/votes`, {
      params,
    });
  }

  getProposalList(pageLimit = 20, nextKey = null, proposalId = null): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      pageLimit: pageLimit,
      nextKey,
      reverse: false,
      proposalId: proposalId,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${this.indexerUrl}/proposal`, {
      params,
    });
  }
}
