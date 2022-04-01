import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
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

  getLastedProposal(): Observable<any> {
    return this.http.get(this.listLastedProposal);
  }

  getVotes(): Observable<any> {
    return this.http.get('../../assets/mock-data/proposal-votes.json');
  }

  getValidatorVotes(): Observable<any> {
    return this.http.get('../../assets/mock-data/proposal-v-votes.json');
  }

  getDepositors(): Observable<any> {
    return this.http.get('../../assets/mock-data/proposal-list-depositor.json');
  }
}
