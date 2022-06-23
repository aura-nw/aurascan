import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IResponsesSuccess, IResponsesTemplates } from 'src/app/core/models/common.model';
import { IContractsResponse } from 'src/app/core/models/contract.model';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class ContractService extends CommonService {
  private contract$ = new BehaviorSubject<any>(null);
  contractObservable: Observable<any>;

  get contract() {
    return this.contract$.value;
  }

  apiUrl = `${this.environmentService.apiUrl.value.cosmos}`;
  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);

    this.contractObservable = this.contract$.asObservable();
  }

  getListContract(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/contracts`, data);
  }

  getListTransaction(token: string): Observable<any> {
    this.setURL();
    // return this.http.get<any>(`${this.apiUrl}/proposals`);
    return this.http.get('../../assets/mock-data/token-list-transfer.json');
  }

  getTransactions(payload: {
    contract_address: string;
    label: string;
    limit: number;
    offset: number;
  }): Observable<IResponsesSuccess<IContractsResponse[]>> {
    return this.http.post<any>(`${this.apiUrl}/contracts/search-transactions`, payload);
  }

  getContractDetail(contractAddress): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/contracts/${contractAddress}`);
  }

  verifyContract(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/contracts/verify-contract`, data);
  }

  getMatchCreationCode(contractAddress: string): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/contracts/match-creation-code/${contractAddress}`);
  }

  readContract(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/contracts/read`, data);
  }

  checkVerified(contractAddress: string): Observable<IResponsesTemplates<any>> {
    return this.http.get<any>(`${this.apiUrl}/contracts/verify/status/${contractAddress}`);
  }

  loadContractDetail(contractAddress): void {
    this.http.get<any>(`${this.apiUrl}/contracts/${contractAddress}`).subscribe((res) => {
      this.contract$.next(res);
    });
  }
}
