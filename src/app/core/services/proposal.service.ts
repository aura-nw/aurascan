import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { INDEXER_URL } from '../constants/common.constant';
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

  getProposal(): Observable<IResponsesTemplates<IProposal[]>> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/proposals`);
  }

  getProposalDetail(proposalId: string | number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/proposals/${proposalId}`);
  }

  getVotes(
    proposalId: string | number,
    voter: string,
    limit: string | number,
    offset: string | number,
  ): Observable<any> {
    return this.http.get<any>(
      `${INDEXER_URL}/transaction?chainid=${this.chainInfo.chainId}&address=${voter}&searchType=proposal_vote&searchKey=proposal_id&searchValue=${proposalId}&pageOffset=${offset}&pageLimit=${limit}&countTotal=true&reverse=false`,
    );
  }

  getValidatorVotes(data): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/proposals/votes/get-by-validator`, data);
  }

  getDepositors(proposalId: string | number): Observable<any> {
    //return this.http.get<any>(`${this.apiUrl}/proposals/${proposalId}/deposits`);
    return this.http.get<any>(
      `${INDEXER_URL}/transaction?chainid=${this.chainInfo.chainId}&searchType=proposal_deposit&searchKey=proposal_id&searchValue=${proposalId}&countTotal=true&reverse=false`,
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

  getProposalList(address: string): Observable<IResponsesTemplates<IProposal[]>> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/proposals/list/get-by-address/${address}`);
  }
}
