import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResponsesSuccess } from 'src/app/core/models/common.model';
import { IContractsResponse } from 'src/app/core/models/contract.model';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class ContractService extends CommonService {
  apiUrl = `${this.environmentService.apiUrl.value.cosmos}`;
  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getListContract(data): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/contracts`, data);
  }

  getListTransaction(token: string): Observable<any> {
    this.setURL();
    // return this.http.get<any>(`${this.apiUrl}/proposals`);
    return this.http.get('../../assets/mock-data/token-list-transfer.json');
  }

  getTransactions(
    address: string,
    _params: { limit: number; offset: number } = { limit: 5, offset: 0 },
  ): Observable<IResponsesSuccess<IContractsResponse[]>> {
    return this.http.get<IResponsesSuccess<IContractsResponse[]>>(`${this.apiUrl}/account/${address}/transaction`, {
      params: _params,
    });
  }

  getContractDetail(contractAddress): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/contracts/${contractAddress}`);
  }

  verifyContract(data: any): Observable<any> {
    return this.http.post<any>(`https://verify-job.dev.aura.network/contracts/verify-contract`, data);
  }

  getMatchCreationCode(contractAddress: string): Observable<any>{
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/contracts/match-creation-code/${contractAddress}`);
  }
}
