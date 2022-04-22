import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';
import { IResponsesTemplates } from '../models/common.model';
import { IListVoteQuery, IListVotesRes, IProposal, IVotingInfo } from '../models/proposal.model';
import { CommonService } from './common.service';

@Injectable()
export class ProposalService extends CommonService {
  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getProposal(): Observable<IResponsesTemplates<IProposal[]>> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/proposals`);
  }

  getProposalDetail(proposalId): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/proposals/${proposalId}`);
  }

  getVotes(proposalId, voter): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/proposals/${proposalId}/votes/${voter}`);
  }

  getValidatorVotes(data): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/proposals/votes/get-by-validator`, data);
  }

  getDepositors(proposalId): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/proposals/${proposalId}/deposits`);
  }

  getListVote(payload: IListVoteQuery): Observable<IResponsesTemplates<IListVotesRes>> {
    return this.http.post<IResponsesTemplates<IListVotesRes>>(`${this.apiUrl}/proposals/votes/get-by-option`, payload);
  }

  getProposalTally(proposalId): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/proposals/${proposalId}/tally`);
  }

  getStakeInfo(delegatorAddress: string): Observable<IResponsesTemplates<IVotingInfo>> {
    return this.http.get<IResponsesTemplates<IVotingInfo>>(`${this.apiUrl}/proposals/delegations/${delegatorAddress}`);
  }
}
