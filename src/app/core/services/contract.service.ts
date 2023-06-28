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
import { Globals } from 'src/app/global/global';

@Injectable()
export class ContractService extends CommonService {
  private contract$ = new BehaviorSubject<any>(null);
  contractObservable: Observable<any>;
  chainInfo = this.environmentService.configValue.chain_info;
  apiUrl = `${this.environmentService.configValue.beUri}`;

  get contract() {
    return this.contract$.value;
  }

  constructor(private http: HttpClient, private environmentService: EnvironmentService, private global: Globals) {
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
    let updateQuery = '';
    const isFilterCW4973 = contractType?.includes('CW4973');
    let typeQuery = isFilterCW4973
      ? '_or: [{code: {type: {_in: $type}}}, {name: {_eq: "crates.io:cw4973"}}],'
      : 'code: {type: {_in: $type}}, name: {_neq: "crates.io:cw4973"}';

    const addressNameTag = this.findNameTag(keyword, this.global.listNameTag);
    if (addressNameTag?.length > 0) {
      keyword = addressNameTag;
    }

    if (keyword?.length >= LENGTH_CHARACTER.CONTRACT) {
      address = keyword;
    } else if (keyword?.length >= LENGTH_CHARACTER.ADDRESS) {
      creator = keyword;
    } else if (/^\d+$/.test(keyword)) {
      codeId = +keyword;
      name = '%' + keyword + '%';
      updateQuery = `_and: {_or: [{name: {_like: "${name}"}}, {code_id: {_eq: ${codeId}}}]},`;
    } else if (keyword?.length > 0) {
      name = '%' + keyword + '%';
      updateQuery = `name: {_ilike: "${name}"},`;
    } else {
      updateQuery = '';
    }
    const operationsDoc = `
    query querySmartContractList($limit: Int = 100, $offset: Int = 0, $type: [String!], $address: String = null, $creator: String =null) {
      ${this.envDB} {
        smart_contract(limit: $limit, offset: $offset, order_by: {updated_at: desc}, where: {${typeQuery} ${updateQuery} address: {_eq: $address}, creator: {_eq: $creator}}) {
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
        smart_contract_aggregate(where: {${typeQuery} ${updateQuery} address: {_eq: $address}, creator: {_eq: $creator}}) {
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
        operationName: 'querySmartContractList',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  loadContractDetail(contractAddress): Observable<any> {
    const contractDoc = `
    query queryContractDetail($contractAddress: String = null) {
      ${this.envDB} {
        smart_contract(limit: 1, where: {address: {_eq: $contractAddress}}) {
          address
          creator
          instantiate_hash
          name     
          cw721_contract {
            name
            symbol
          }
          cw20_contract {
            name
            symbol
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
        operationName: 'queryContractDetail',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListContractByCode(payload): Observable<any> {
    const contractDoc = `
    query queryListContractByCodeID($limit: Int = 100, $offset: Int = 0, $code_id: Int = 0) {
      ${this.envDB} {
        smart_contract(limit: $limit, offset: $offset, where: {code_id: {_eq: $code_id}}, order_by: {updated_at: desc}) {
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
        smart_contract_aggregate(where: {code_id: {_eq: $code_id}}) {
          aggregate {
            count
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
          limit: payload.limit,
          offset: payload.offset,
        },
        operationName: 'queryListContractByCodeID',
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

  getDetailCW4973(contractAddress: string, tokenId): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/contracts/${contractAddress}/nft/${tokenId}`);
  }

  getNFTDetail(address, tokenId): Observable<any> {
    const contractDoc = `
    query queryCW721Owner($address: String, $tokenId: String) {
      ${this.envDB} { 
        data: cw721_token(where: { cw721_contract: {smart_contract: {address: {_eq: $address}}}, token_id: {_eq: $tokenId}}) { 
        id
        token_id
        owner
        media_info
        burned
        cw721_contract {
          name
          smart_contract {
            name
            address
            creator
          }
          symbol
          minter
        }
        } 
      } 
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: contractDoc,
        variables: {
          address: address,
          tokenId: tokenId,
        },
        operationName: 'queryCW721Owner',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getVerifyCodeStep(codeId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/contracts/verify-code-id/${codeId}`);
  }

  getListCodeId(data: any): Observable<any> {
    let keyword = data?.keyword ? data?.keyword : null;
    let subQuery = '';
    if (keyword) {
      if (keyword.length >= LENGTH_CHARACTER.CONTRACT) {
        subQuery = `smart_contracts: {address: {_eq: "${keyword}"}}`;
      } else if (keyword.length >= LENGTH_CHARACTER.ADDRESS) {
        subQuery = `creator: {_eq: "${keyword}"}`;
      } else {
        subQuery = `code_id: {_eq: ${keyword}}`;
      }
    }

    const query = `query queryContractCode($limit: Int, $offset: Int) {
      ${this.envDB} {
        code(where: {${subQuery}}, order_by: {code_id: desc}, limit: $limit, offset: $offset) {
          code_id
          creator
          store_hash
          type
          status
          created_at
          code_id_verifications(order_by: {updated_at: desc}) {
            verified_at
            compiler_version
            github_url
            verification_status
          }
          smart_contracts {
            name
          }
          smart_contracts_aggregate {
            aggregate {
              count
            }
          }
        } 
        code_aggregate(where: { ${subQuery} }) { 
          aggregate {
            count 
          } 
        } 
      } 
    }`;
    return this.http
      .post<any>(this.graphUrl, {
        query: query,
        variables: {
          limit: data?.limit,
          offset: data?.offset,
        },
        operationName: 'queryContractCode',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getCodeIDDetail(codeId: number): Observable<any> {
    const query = `query queryContractCodeDetail($codeId: Int) {
      ${this.envDB} {
        code(where: {code_id: {_eq: ${codeId}}}) {
          code_id
          creator
          store_hash
          type
          status
          created_at
          code_id_verifications(order_by: {updated_at: desc}) {
            verified_at
            compiler_version
            github_url
            verification_status
          }
          smart_contracts {
            name
          }
          smart_contracts_aggregate {
            aggregate {
              count
            }
          }
        }
      } 
    }`;
    return this.http
      .post<any>(this.graphUrl, {
        query: query,
        variables: {},
        operationName: 'queryContractCodeDetail',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}
