import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import _ from 'lodash';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { LCD_COSMOS } from 'src/app/core/constants/url.constant';
import { IResponsesTemplates } from 'src/app/core/models/common.model';
import { ContractType, SmartContractListReq } from 'src/app/core/models/contract.model';
import { LENGTH_CHARACTER } from '../constants/common.constant';
import { ContractRegisterType, EvmContractRegisterType } from '../constants/contract.enum';
import { EWalletType } from '../constants/wallet.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { transferAddress } from '../utils/common/address-converter';
import { CommonService } from './common.service';
import { NameTagService } from './name-tag.service';

@Injectable()
export class ContractService extends CommonService {
  private contract$ = new BehaviorSubject<any>(null);
  contractObservable: Observable<any>;
  chainInfo = this.environmentService.chainInfo;
  apiUrl = `${this.environmentService.backend}`;
  horoscopeApi = this.horoscope?.url + this.horoscope?.rest;

  get contract() {
    return this.contract$.value;
  }

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
    private nameTagService: NameTagService,
  ) {
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
    const isIncludeCW4973 = contractType?.includes(ContractRegisterType.CW4973);

    const addressNameTag = this.nameTagService.findAddressByNameTag(keyword);
    if (addressNameTag?.length > 0) {
      keyword = addressNameTag;
    }

    let filterName = '';
    if (this.isValidContract(keyword)) {
      address = keyword;
    } else if (this.isValidAddress(keyword) || this.isValidEvmAddress(keyword)) {
      const { accountAddress } = transferAddress(this.addressPrefix, keyword);
      creator = accountAddress;
    } else if (/^\d+$/.test(keyword)) {
      codeId = +keyword;
      name = '%' + keyword + '%';
      updateQuery = `_and: {_or: [{name: {_like: "${name}"}}, {code_id: {_eq: ${codeId}}}]},`;
    } else if (keyword?.length > 0) {
      filterName = `_ilike: "%${keyword}%"`;
    } else {
      updateQuery = '';
    }

    const FILTER_ALL = '';
    let typeQuery = 'code: {_or: [{type: {_in: $type}}, {_and: {type: {_is_null: true}}}]}';
    if (isIncludeCW4973) {
      if (contractType?.length >= 2) {
        filterName = filterName?.length > 0 ? filterName : '_eq: "crates.io:cw4973"';
        typeQuery = contractType?.includes(FILTER_ALL)
          ? `_or: [{code: {_or: [{type: {_in: $type}}, {_and: {type: {_is_null: true}}}]}}, {name: {${filterName}}}],`
          : `_or: [{code: {type: {_in: $type}}}, {name: {${filterName}}}],`;
      } else {
        filterName = `, ${filterName}`;
        typeQuery = contractType?.includes(FILTER_ALL)
          ? `_or: [{code: {_or: [{type: {_in: $type}}, {_and: {type: {_is_null: true}}}]}}, {name: {_eq: "crates.io:cw4973"}}],`
          : (() => {
              // CW4973 is CW721 Type
              contractType = [ContractRegisterType.CW721];
              return `_and: [{code: {type: {_in: $type}}}, {name: {_eq: "crates.io:cw4973"}}],`;
            })();
      }
    } else if (
      contractType?.includes(ContractRegisterType.CW721) ||
      contractType?.includes(ContractRegisterType.CW20)
    ) {
      filterName = `, ${filterName}`;
      typeQuery = contractType?.includes(FILTER_ALL)
        ? `code: {_or: [{type: {_in: $type}}, {_and: {type: {_is_null: true}}}]}, name: {_neq: "crates.io:cw4973" ${filterName}}`
        : `code: {type: {_in: $type}}, name: {_neq: "crates.io:cw4973" ${filterName}}`;
    } else if (filterName?.length > 0) {
      typeQuery += `name: {${filterName}},`;
    }

    const operationsDoc = `
    query querySmartContractList($limit: Int = 100, $offset: Int = 0, $type: [String!], $address: String = null, $creator: String =null) {
      ${this.envDB} {
        smart_contract(limit: $limit, offset: $offset, order_by: {updated_at: desc}, where: {${typeQuery} ${updateQuery} address: {_eq: $address}, creator: {_eq: $creator}, status: {_eq: "LATEST"}}) {
          address
          name
          label
          code_id
          version
          code {
            type
            code_id_verifications(order_by: {updated_at: desc}) {
              compiler_version
              verified_at
              verification_status
            }
          }
          updated_at
          creator
          cw20_contract {
            name
          }
          cw721_contract {
            name
          }
        }
        smart_contract_aggregate(where: {${typeQuery} ${updateQuery} address: {_eq: $address}, creator: {_eq: $creator}, status: {_eq: "LATEST"}}) {
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

  getListEvmContract({
    keyword,
    limit,
    offset,
    contractType,
  }: {
    name?: string;
    keyword?: string;
    limit?: number;
    offset?: number;
    contractType?: string[];
  }) {
    const addressNameTag = this.nameTagService.findAddressByNameTag(keyword);
    let address;
    if (addressNameTag?.length > 0) {
      const { accountEvmAddress } = transferAddress(this.addressPrefix, addressNameTag);
      address = accountEvmAddress;
    } else if (this.isValidEvmAddress(keyword) || this.isValidAddress(keyword)) {
      const { accountEvmAddress } = transferAddress(this.addressPrefix, keyword);
      address = accountEvmAddress;
    } else if (keyword?.length > 0) {
      return of(null);
    }

    let typeQuery = '_or: [{address: {_eq: $address}}, {creator: {_eq: $address}}]';
    if (contractType?.length > 0) {
      if (contractType?.includes('Others')) {
        contractType = contractType.filter((k) => k != 'Others');
        const listDefault = [
          EvmContractRegisterType.ERC20,
          EvmContractRegisterType.ERC721,
          EvmContractRegisterType.ERC1155,
        ];
        const listNotIn = _.pull([...listDefault.map((item) => item)], ...contractType);
        typeQuery = '_or: [{type: {_is_null:true}}, {type: {_nin :[' + listNotIn + ']}}], _and: {' + typeQuery + '}';
      } else {
        typeQuery = 'type: {_in: [' + contractType + ']},' + typeQuery;
      }
    }

    const operationsDoc = `
    query EvmSmartContractList($limit: Int = 100, $offset: Int = 0, $address: String = null) {
      ${this.envDB} {
        evm_smart_contract(limit: $limit, offset: $offset, order_by: {updated_at: desc}, where: {${typeQuery} }) {
          address
          creator
          type
          updated_at
          erc20_contract {
            symbol
            name
          }
          evm_contract_verifications(limit: 1, where: {status: {_eq:"SUCCESS"}}){
            status
          }
        }
        evm_smart_contract_aggregate(where: {${typeQuery}}) {
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
          address: address,
        },
        operationName: 'EvmSmartContractList',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  findEvmContract(keyword: string) {
    const operationsDoc = `
    query FindEvmSmartContract($address: String = null) {
      ${this.envDB} {
        evm_smart_contract(limit: 1, where: {address: {_eq: $address}}) {
          address
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          address: keyword?.toLowerCase(),
        },
        operationName: 'FindEvmSmartContract',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  findEvmContractList(listAddr: string[]) {
    const operationsDoc = `
    query findEvmContractList($listAddress: [String!] = null) {
      ${this.envDB} {
        evm_smart_contract(where: {address: {_in: $listAddress}}, limit: 40, offset: 0) {
          address
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          listAddress: listAddr.map(i=> i?.toLowerCase())
        },
        operationName: 'findEvmContractList',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  loadContractDetail(contractAddress): Observable<any> {
    const contractDoc = `
    query queryContractDetail($contractAddress: String = null) {
      ${this.envDB} {
        smart_contract(limit: 1, where: {address: {_eq: $contractAddress}, status: {_eq: "LATEST"}}) {
          id
          address
          creator
          instantiate_hash
          name
          version
          label  
          cw721_contract {
            name
            symbol
          }
          cw20_contract {
            name
            symbol
            smart_contract {
              address
            }  
          }
          code {
            type
            code_id
            code_id_verifications(order_by: {updated_at: desc}) {
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

  queryEvmContractByAddress(address: string) {
    const contractDoc = `query EVMContractDetail($address: String = "") {
      ${this.envDB} {
        evm_smart_contract(where: {address: {_eq: $address}}, limit: 1) {
          address
          created_at
          created_hash
          created_height
          creator
          id
          type
          updated_at
          erc20_contract {
            symbol
            name
          }
          erc721_contract {
            symbol
            name
          }
        }
        evm_contract_verification(
          where: {contract_address: {_eq: $address}, status: {_eq: "SUCCESS"}}
        ) {
          status
          abi
          code_hash
          contract_address
          creator_tx_hash
          compiler_version
          compile_detail
          contract_name
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: contractDoc,
        variables: {
          address: address?.toLowerCase(),
        },
        operationName: 'EVMContractDetail',
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
            code_id_verifications(order_by: {updated_at: desc}) {
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
        data: smart_contract(where: {address: {_eq: $address}}) {
          name
          creator
          address
          cw721_contract {
            name
            minter
            symbol
            cw721_tokens(where: {token_id: {_eq: $tokenId}}) {
              id
              token_id
              owner
              media_info
              burned
            }
          }
          code {
            code_id_verifications {
              id
              verification_status
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
          address: address,
          tokenId: tokenId,
        },
        operationName: 'queryCW721Owner',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getNFTErc721Detail(address, tokenId): Observable<any> {
    const contractDoc = `
    query queryErc721Owner($address: String, $tokenId: String) {
      ${this.envDB} { 
        data: erc721_token(
          where: {token_id: {_eq: $tokenId}, erc721_contract: {evm_smart_contract: {address: {_eq: $address}}}}
        ) {
          id
          token_id
          owner
          media_info
          erc721_contract {
            name
            symbol
            address
            evm_smart_contract {
              code_hash
              creator
              address
              evm_contract_verifications {
                status
                id
              }
              type
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
          address: address,
          tokenId: tokenId,
        },
        operationName: 'queryErc721Owner',
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

  verifyEvmContract(formData: FormData) {
    return this.http.post(`${this.environmentService.verifyContractUrl}/evm/file`, formData);
  }

  checkVerifyEvmContractStatus(address: string, id: number) {
    const query = `query VerifyEvmContractStatus($address: String = "", $id: Int = 10) {
      ${this.envDB} {
        evm_contract_verification(where: {contract_address: {_eq: $address}, id: {_eq: $id}}) {
          status
          contract_address
          compile_detail
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: query,
        variables: {
          address,
          id,
        },
        operationName: 'VerifyEvmContractStatus',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getProxyContractAbi(address: string) {
    const query = `query ProxyContractDetail($address: String = "") {
      ${this.envDB} {
        evm_smart_contract(where: {address: {_eq: $address}}) {
          evm_proxy_histories(order_by: {block_height: desc}, where: {implementation_contract: {_is_null: false}}) {
            proxy_contract
            implementation_contract
            block_height
          }
        }
      }
    }
    `;

    return this.http
      .post<any>(this.graphUrl, {
        query: query,
        variables: {
          address: address?.toLocaleLowerCase(),
        },
        operationName: 'ProxyContractDetail',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  queryTokenByContractAddress(address: string) {
    if (address.toLowerCase() == this.environmentService.coinMinimalDenom) {
      return of({
        type: 'NATIVE',
        address,
      });
    }

    if (address.length == LENGTH_CHARACTER.IBC) {
      return of({
        type: 'IBC',
        address,
      });
    }

    let type: ContractType = address.startsWith('0x') ? 'EVM' : 'COSMOS';

    const smartContract =
      type == 'COSMOS'
        ? `
        smart_contract(where: {address: {_eq: $address}}) {
          address
          name
          cw20_contract {
            symbol
          }
          cw721_contract {
            symbol
          }
        }
        `
        : `
        evm_smart_contract(where: {address: {_eq: $address}}) {
          id
          address
          erc20_contract {
            symbol
            address
          }
          erc721_contract {
            symbol
            address
          }
        }
        `;

    const query = `query TokenByContractAddress($address: String = "") {
      ${this.envDB} {
        ${smartContract}
      }
    }
    `;

    return this.http
      .post<any>(this.graphUrl, {
        query,
        variables: {
          address: address?.toLowerCase(),
        },
        operationName: 'TokenByContractAddress',
      })
      .pipe(
        map((res) => (res?.data ? res?.data[this.envDB] : null)),
        map((x) => {
          if (type == 'COSMOS') {
            type = _.get(x, 'smart_contract[0].cw20_contract.symbol') ? 'CW20' : type;
            type = _.get(x, 'smart_contract[0].cw721_contract.symbol') ? 'CW721' : type;

            if (type == 'CW721') {
              type = _.get(x, 'smart_contract[0].name') == 'crates.io:cw4973' ? 'CW4973' : type;
            }
          } else {
            type = _.get(x, 'evm_smart_contract[0].erc20_contract.address') ? 'ERC20' : type;
            type = _.get(x, 'evm_smart_contract[0].erc721_contract.address') ? 'ERC721' : type;
          }

          return type == 'EVM' || type == 'COSMOS'
            ? null
            : {
                type,
                address,
              };
        }),
      );
  }

  loadProxyContractDetail(contractAddress: string): Observable<any> {
    return this.http.get<any>(
      `${this.horoscopeApi}/evm-proxy?contractAddress=${contractAddress}&chainId=${this.chainInfo.chainId}`,
    );
  }

  getListContractInfo(listContractAddress: string[]): Observable<any> {
    const query = `query queryListContract($address: [String!]) {
      ${this.envDB} {
        evm_contract_verification(where: {contract_address: {_in: $address}}, order_by: {id: desc}) {
          status
          contract_address
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: query,
        variables: {
          address: listContractAddress,
        },
        operationName: 'queryListContract',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}
