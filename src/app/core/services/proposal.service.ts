import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { INDEXER_URL } from '../constants/common.constant';
import { LCD_COSMOS } from '../constants/url.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { IResponsesTemplates } from '../models/common.model';
import { IListVoteQuery, IListVotesRes, IProposal, IVotingInfo } from '../models/proposal.model';
import { CommonService } from './common.service';

@Injectable()
export class ProposalService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getProposalDetail(proposalId: string | number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/proposals/${proposalId}`);
  }

  getVotes(proposalId: string | number, voter: string, limit: string | number, offset: string | number) {
    return axios.get(
      `${this.chainInfo.rest}/${LCD_COSMOS.TX}/txs?events=proposal_vote.proposal_id%3D%27${proposalId}%27&events=transfer.sender%3D%27${voter}%27&pagination.offset=${offset}&pagination.limit=${limit}&order_by=ORDER_BY_DESC`,
    );
  }

  getValidatorVotes(data): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/proposals/votes/get-by-validator`, data);
  }

  getDepositors(proposalId: string | number) {
    return axios.get(
      `${this.chainInfo.rest}/${LCD_COSMOS.TX}/txs?events=proposal_deposit.proposal_id%3D%27${proposalId}%27&order_by=ORDER_BY_DESC`,
    );
  }

  getListVote(payload: IListVoteQuery): Observable<IResponsesTemplates<IListVotesRes>> {
    return this.http.post<IResponsesTemplates<IListVotesRes>>(`${this.apiUrl}/proposals/votes/get-by-option`, payload);
  }

  getProposalTally(proposalId: string | number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/proposals/${proposalId}/tally`);
  }

  getStakeInfo(delegatorAddress: string): Observable<IResponsesTemplates<IVotingInfo>> {
    return this.http.get<IResponsesTemplates<IVotingInfo>>(`${this.apiUrl}/proposals/delegations/${delegatorAddress}`);
  }

  getProposalDetailFromNode(proposalId: string | number): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/proposals/node/${proposalId}`);
  }

  // getProposalList(address: string): Observable<IResponsesTemplates<IProposal[]>> {
  //   this.setURL();
  //   return this.http.get<any>(`${this.apiUrl}/proposals/list/get-by-address/${address}`);
  // }

  getProposalList(pageLimit = 20, nextKey = null, proposalId = null): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      pageLimit,
      nextKey,
      reverse: false,
      proposalId: proposalId,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${INDEXER_URL}/proposal`, {
      params,
    });
  }
}
