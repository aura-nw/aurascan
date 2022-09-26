import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { IResponsesSuccess, IResponsesTemplates } from 'src/app/core/models/common.model';
import { DeployContractListReq, IContractsResponse, SmartContractListReq } from 'src/app/core/models/contract.model';
import { INDEXER_URL } from '../constants/common.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';
import axios from 'axios';
import { LCD_COSMOS } from 'src/app/core/constants/url.constant';

@Injectable()
export class ContractService extends CommonService {
  private contract$ = new BehaviorSubject<any>(null);
  contractObservable: Observable<any>;
  chainInfo = this.environmentService.configValue.chain_info;

  get contract() {
    return this.contract$.value;
  }

  apiUrl = `${this.environmentService.configValue.beUri}`;
  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);

    this.contractObservable = this.contract$.asObservable();
  }

  getListContract(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/contracts`, data);
  }

  getTransactionsIndexer(pageLimit: string | number, contractAddress = '', type: string, nextKey = ''): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      searchType: type,
      searchKey: '_contract_address',
      searchValue: contractAddress,
      pageLimit,
      nextKey,
      countTotal: true,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${INDEXER_URL}/transaction`, {
      params,
    });
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

  checkVerified(contractAddress: string): Observable<IResponsesTemplates<any>> {
    return this.http.get<any>(`${this.apiUrl}/contracts/verify/status/${contractAddress}`);
  }

  loadContractDetail(contractAddress): void {
    this.http.get<any>(`${this.apiUrl}/contracts/${contractAddress}`).subscribe((res) => {
      this.contract$.next(res);
    });
  }

  registerContractType(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/contract-codes`, data);
  }

  getListTypeContract(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/contract-codes/list`, data);
  }

  updateContractType(codeID: number, typeContract: string): Observable<any> {
    const payload = {
      type: typeContract
    }
    return this.http.put<any>(`${this.apiUrl}/contract-codes/${codeID}`, payload);
  }

  getListSmartContract(params: SmartContractListReq): Observable<IResponsesTemplates<any>>{
    return this.http.get<any>(`${this.apiUrl}/contracts/get-contract-by-creator?creatorAddress=${params.creatorAddress}&codeId=${params.codeId}&status=${params.status}&limit=${params.limit}&offset=${params.offset}`);
  }

  getSmartContractStatus() {
    return axios.get(`${this.apiUrl}/contracts/get-smart-contract-status`);
  }

  getContractIdList(creator: string) {
    return axios.get(`${this.apiUrl}/contracts/get-code-ids/${creator}`);
  }

  createContractRequest(data: DeployContractListReq) {
    let api_url = '';
    switch (this.apiUrl) {
      case 'https://serenity-api.aurascan.io/api/v1':
        api_url = 'https://contract-deployer.serenity.aurascan.io/api/v1';
        break;
      case 'https://euphoria-api.aurascan.io/api/v1':
        api_url = 'https://contract-deployer.serenity.aurascan.io/api/v1';
        break;
      default:
        api_url = 'https://contract-deployer.dev.aura.network/admin/v1';
        break;
    }
    return this.http.post<any>(api_url + `/request/create`, data);
  }
}
