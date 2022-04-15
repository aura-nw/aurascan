import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class ProposalService extends CommonService {
  // apiUrl = `${this.environmentService.apiUrl.value.cosmos}`;
  listProposal: string = '../../assets/mock-data/proposal-list.json';
  listLastedProposal: string = '../../assets/mock-data/proposal-list-lasted.json';
  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService
  ) {
    super(http, environmentService);
  }

  getProposal(limit, offset): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/proposals`);
  }

  getProposalDetail(proposalId): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/proposals/${proposalId}`);
  }

  getVotes(proposalId, voter): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/proposals/${proposalId}/votes/${voter}`);
  }

  getValidatorVotes(proposalId, option, limit, offset): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/proposals/${proposalId}/deposits`);
  }

  getDepositors(proposalId): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/proposals/${proposalId}/deposits`);
  }
}
