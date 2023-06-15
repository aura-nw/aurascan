import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LCD_COSMOS } from 'src/app/core/constants/url.constant';
import { IResponsesTemplates } from 'src/app/core/models/common.model';
import { SmartContractListReq } from 'src/app/core/models/contract.model';
import { LENGTH_CHARACTER } from '../constants/common.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class ContractService extends CommonService {
  private contract$ = new BehaviorSubject<any>(null);
  contractObservable: Observable<any>;
  chainInfo = this.environmentService.configValue.chain_info;
  apiUrl = `${this.environmentService.configValue.beUri}`;

  get contract() {
    return this.contract$.value;
  }

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);

    this.contractObservable = this.contract$.asObservable();
  }

  getListContract({
    codeId,
    creator,
    address,
    name,
    keyword,
    limit,
    offset,
    contractType,
  }: {
    codeId?: number;
    creator?: string;
    address?: string;
    name?: string;
    keyword?: string;
    limit?: number;
    offset?: number;
    contractType?: string[];
  }) {
    // codeId = null;
    // creator = null;
    // address = null;
    // name = null;
    let updateQuery = '';

    if (keyword?.length >= LENGTH_CHARACTER.CONTRACT) {
      address = keyword;
    } else if (keyword?.length >= LENGTH_CHARACTER.ADDRESS) {
      creator = keyword;
    } else if (/^\d+$/.test(keyword)) {
      codeId = +keyword;
      name = '%' + keyword + '%';
      updateQuery = `_or: [{name: {_like: "${name}"}}, {code_id: {_eq: ${codeId}}}],`;
    } else if (keyword?.length > 0) {
      name = '%' + keyword + '%';
      updateQuery = `name: {_like: "${name}"},`;
    } else {
      updateQuery = '';
    }
    const operationsDoc = `
    query auratestnet_smart_contract($limit: Int = 100, $offset: Int = 0, $type: [String!], $address: String = null, $creator: String =null) {
      ${this.envDB} {
        smart_contract(limit: $limit, offset: $offset, order_by: {updated_at: desc}, where: {code: {type: {_in: $type}}, ${updateQuery} address: {_eq: $address}, creator: {_eq: $creator}}) {
          address
          name
          code_id
          code {
            type
            code_id_verifications {
              compiler_version
              verified_at
              verification_status
            }
          }
          updated_at
          creator
        }
        smart_contract_aggregate(where: {code: {type: {_in: $type}}, ${updateQuery} address: {_eq: $address}, creator: {_eq: $creator}}) {
          aggregate {
            count
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: limit,
          offset: offset,
          type: contractType,
          creator: creator,
          address: address,
        },
        operationName: 'auratestnet_smart_contract',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  loadContractDetailV2(contractAddress): Observable<any> {
    const contractDoc = `
    query auratestnet_contract($contractAddress: String = null) {
      ${this.envDB} {
        smart_contract(limit: 1, where: {address: {_eq: $contractAddress}}) {
          address
          creator
          instantiate_hash        
          cw721_contract {
            name
            symbol
            smart_contract {
              name
            }
          }
          code {
            type
            code_id
            code_id_verifications {
              code_id
              compiler_version
              created_at
              data_hash
              execute_msg_schema
              github_url
              id
              instantiate_msg_schema
              query_msg_schema
              updated_at
              verification_status
              verified_at
              s3_location
            }
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: contractDoc,
        variables: {
          contractAddress: contractAddress,
        },
        operationName: 'auratestnet_contract',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListContractByCode(payload): Observable<any> {
    const contractDoc = `
    query MyQuery($code_id: Int = 0) {
      ${this.envDB} {
        smart_contract(where: {code_id: {_eq: $code_id}}, order_by: {updated_at: desc}) {
          id
          instantiate_hash
          name
          creator
          created_at
          code_id
          address
          code {
            status
            type
            creator
            code_id_verifications {
              verified_at
            }
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: contractDoc,
        variables: {
          code_id: payload.codeId,
        },
        operationName: 'MyQuery',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getContractBalance(contractAddress) {
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.BALANCE}/${contractAddress}`);
  }

  setContract(contract: any) {
    this.contract$.next(contract);
  }

  verifyCodeID(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/contracts/verify-code-id`, data);
  }

  checkVerified(codeID: string): Observable<IResponsesTemplates<any>> {
    return this.http.get<any>(`${this.apiUrl}/contracts/verify/status/${codeID}`);
  }

  loadContractDetail(contractAddress): void {
    this.http.get<any>(`${this.apiUrl}/contracts/${contractAddress}`).subscribe((res) => {
      this.contract$.next(res.data);
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
