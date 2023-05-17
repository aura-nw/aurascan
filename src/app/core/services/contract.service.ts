import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import * as _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { IResponsesTemplates } from 'src/app/core/models/common.model';
import { DeployContractListReq, SmartContractListReq } from 'src/app/core/models/contract.model';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';
import { checkEnvQuery } from '../utils/common/info-common';
import { map } from 'rxjs/operators';

@Injectable()
export class ContractService extends CommonService {
  private contract$ = new BehaviorSubject<any>(null);
  contractObservable: Observable<any>;
  chainInfo = this.environmentService.configValue.chain_info;
  indexerUrl = `${this.environmentService.configValue.indexerUri}`;
  apiUrl = `${this.environmentService.configValue.beUri}`;
  graphUrl = `${this.environmentService.configValue.graphUrl}`;

  get contract() {
    return this.contract$.value;
  }

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);

    this.contractObservable = this.contract$.asObservable();
  }

  getListContract(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/contracts`, data);
  }

  getTransactionsIndexerV2(
    pageLimit: string | number,
    contractAddress = '',
    type: string,
    hashIns = '',
    nextKey = null,
  ) {
    const envDB = checkEnvQuery(this.environmentService.configValue.env);
    let filterQuery = '';
    if (type) {
      if (type === 'execute' && hashIns) {
        filterQuery = `, hash: {_neq: ${hashIns}}`;
      } else if (type === 'instantiate') {
        filterQuery = `, events : {type: {_eq: "${type}" }}`;
      }
    }
    if (nextKey) {
      filterQuery = filterQuery.concat(', id: {_lt: ' + `${nextKey}` + '}');
    }

    const operationsDoc = `
    query getListTx($limit: Int, $event_attr_val: String, $tx_msg_val: jsonb) {
      ${envDB} {
        transaction(limit: $limit, order_by: {timestamp: desc}, where: {_and: {_or: [{events: {event_attributes: {key: {_eq: "_contract_address"}, value: {_eq: $event_attr_val}}}}, {transaction_messages: {content: {_contains: $tx_msg_val}}}] ${filterQuery} }}) {
          id
          height
          hash
          timestamp
          code
          gas_used
          gas_wanted
          data(path: "tx")
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: pageLimit,
          event_attr_val: contractAddress,
          tx_msg_val: {
            contract: contractAddress,
          },
        },
        operationName: 'getListTx',
      })
      .pipe(map((res) => (res?.data ? res?.data[envDB] : null)));
  }

  verifyCodeID(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/contracts/verify-code-id`, data);
  }

  checkVerified(codeID: string): Observable<IResponsesTemplates<any>> {
    return this.http.get<any>(`${this.apiUrl}/contracts/verify/status/${codeID}`);
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
      type: typeContract,
    };
    return this.http.put<any>(`${this.apiUrl}/contract-codes/${codeID}`, payload);
  }

  getListSmartContract(params: SmartContractListReq): Observable<IResponsesTemplates<any>> {
    return this.http.get<any>(
      `${this.apiUrl}/contracts/get-contract-by-creator?creatorAddress=${params.creatorAddress}&codeId=${params.codeId}&status=${params.status}&limit=${params.limit}&offset=${params.offset}`,
    );
  }

  getNFTDetail(contractAddress: string, tokenId): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/contracts/${contractAddress}/nft/${tokenId}`);
  }

  getListContractById(codeId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/contract-codes/${codeId}`);
  }

  getVerifyCodeStep(codeId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/contracts/verify-code-id/${codeId}`);
  }

  getListCodeID(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/contracts/contract-code/list`, data);
  }

  getCodeIDDetail(codeId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/contracts/contract-code/${codeId}`);
  }
}
