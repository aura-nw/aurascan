import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LENGTH_CHARACTER } from '../constants/common.constant';
import { ApiAccountService } from '../data-services/api-account.service';
import { ApiCw20TokenService } from '../data-services/api-cw20-token.service';
import { TYPE_CW4973 } from '../constants/contract.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';
import { isEvmAddress } from '../utils/common/validation';

@Injectable()
export class AccountService extends CommonService {
    lcd = this.environmentService.chainConfig.chain_info.rest;

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
    private apiCw20TokenService: ApiCw20TokenService,
    private apiService: ApiAccountService,
  ) {
    super(http, environmentService);
  }

  getAccountInfo(address: string) {
    return this.http.get(`${this.lcd}/cosmos/auth/v1beta1/accounts/${address}`);
  }

  getAccountDetail(account_id: string | number): Observable<any> {
    return this.apiService.getAccountByAddress(account_id as string);
  }

  getAssetCW20ByOwner(payload): Observable<any> {
    return this.apiCw20TokenService.getByOwner(payload?.account_address, payload?.evm_address);
  }

  getAssetCW721ByOwner(payload): Observable<any> {
    if (payload.keyword?.length >= LENGTH_CHARACTER.ADDRESS) {
      payload.contractAddress = payload.keyword;
    } else if (payload.keyword?.length > 0) {
      payload.token_id = payload.keyword;
    }
    const operationsDoc = `
    query queryAssetCW721(
      $contract_address: String
      $limit: Int = 10
      $tokenId: String = null
      $owner: String = null
      $offset: Int = 0
    ) {
      ${this.envDB} {
        cw721_token(
          limit: $limit
          offset: $offset
          where: {
            cw721_contract: {
              smart_contract: { address: { _eq: $contract_address }, name: {_neq: "${TYPE_CW4973}"} }
            }
            token_id: { _eq: $tokenId }
            owner: { _eq: $owner }
            burned: {_eq: false}
          }
          order_by: [{ last_updated_height: desc }, { id: desc }]
        ) {
          id
          token_id
          owner
          media_info
          last_updated_height
          created_at
          burned
          cw721_contract {
            name
            symbol
            smart_contract {
              name
              address
            }
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload?.limit || 20,
          offset: payload.offset,
          contract_address: payload?.contractAddress || payload?.address,
          nextKeyLastUpdatedHeight: payload?.nextKey,
          nextKeyId: payload?.nextKeyId,
          tokenId: payload?.token_id,
          owner: payload?.owner,
        },
        operationName: 'queryAssetCW721',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  countAssetCW721ByOwner(payload): Observable<any> {
    if (payload.keyword?.length >= LENGTH_CHARACTER.ADDRESS) {
      payload.contractAddress = payload.keyword;
    } else if (payload.keyword?.length > 0) {
      payload.token_id = payload.keyword;
    }
    const operationsDoc = `
    query queryAssetCW721(
      $contract_address: String
      $tokenId: String = null
      $owner: String = null
    ) {
      ${this.envDB} {
        cw721_token_aggregate(where: {cw721_contract: {smart_contract: {address: {_eq: $contract_address}, name: {_neq: "${TYPE_CW4973}"}}}, token_id: {_eq: $tokenId}, owner: {_eq: $owner}, burned: {_eq: false}}, order_by: [{last_updated_height: desc}, {id: desc}]) {
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
          contract_address: payload?.contractAddress || payload?.address,
          nextKeyLastUpdatedHeight: payload?.nextKey,
          nextKeyId: payload?.nextKeyId,
          tokenId: payload?.token_id,
          owner: payload?.owner,
        },
        operationName: 'queryAssetCW721',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListCw721CollectionByOwner(payload): Observable<any> {
    const operationsDoc = `
    query queryListCollection($owner: String = null)  {
      ${this.envDB} {
        cw721_contract(where: {cw721_tokens: {owner: {_eq: $owner}, burned: {_eq: false}}, smart_contract: {name: {_neq: "crates.io:cw4973"}}}, order_by: {name: asc}) {
          name
          symbol
          cw721_tokens_aggregate(where: {owner: {_eq: $owner}, burned: {_eq: false}}) {
            aggregate {
              count
            }
          }
          smart_contract {
            address
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          owner: payload?.owner,
        },
        operationName: 'queryListCollection',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  countListCw721CollectionByOwner(payload): Observable<any> {
    const operationsDoc = `
    query queryListCollection($owner: String = null)  {
      ${this.envDB} {
        cw721_token_aggregate(where: {cw721_contract: {smart_contract: {name: {_neq: "crates.io:cw4973"}}}, owner: {_eq: $owner}, burned: {_eq: false}}) {
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
          owner: payload?.owner,
        },
        operationName: 'queryListCollection',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getAssetERC721ByOwner(payload): Observable<any> {
    if (payload.keyword?.length >= LENGTH_CHARACTER.EVM_ADDRESS && isEvmAddress(payload.keyword)) {
      payload.contractAddress = payload.keyword;
    } else if (payload.keyword?.length > 0) {
      payload.token_id = payload.keyword;
    }
    const operationsDoc = `
    query queryAssetERC721(
      $contract_address: String
      $limit: Int = 10
      $tokenId: String = null
      $owner: String = null
      $offset: Int = 0
    ) {
      ${this.envDB} {
        cw721_token: erc721_token(
          limit: $limit
          offset: $offset
          where: {
            erc721_contract: {
              evm_smart_contract: { address: { _eq: $contract_address } }
            }
            token_id: { _eq: $tokenId }
            owner: { _eq: $owner }
          }
          order_by: [{ last_updated_height: desc }, { id: desc }]
        ) {
          id
          token_id
          owner
          media_info
          last_updated_height
          created_at
          cw721_contract: erc721_contract {
            name
            symbol
            smart_contract: evm_smart_contract {
              address
            }
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload?.limit || 20,
          offset: payload.offset,
          contract_address: payload?.contractAddress || payload?.address,
          nextKeyLastUpdatedHeight: payload?.nextKey,
          nextKeyId: payload?.nextKeyId,
          tokenId: payload?.token_id,
          owner: payload?.owner,
        },
        operationName: 'queryAssetERC721',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  countAssetERC721ByOwner(payload): Observable<any> {
    if (payload.keyword?.length >= LENGTH_CHARACTER.ADDRESS) {
      payload.contractAddress = payload.keyword;
    } else if (payload.keyword?.length > 0) {
      payload.token_id = payload.keyword;
    }
    const operationsDoc = `
    query queryAssetERC721(
      $contract_address: String
      $tokenId: String = null
      $owner: String = null
    ) {
      ${this.envDB} {
        cw721_token_aggregate: erc721_token_aggregate(
          where: {erc721_contract: {evm_smart_contract: {address: {_eq: $contract_address}}}, token_id: {_eq: $tokenId}, owner: {_eq: $owner}}
          order_by: [{last_updated_height: desc}, {id: desc}]
        ) {
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
          contract_address: payload?.contractAddress || payload?.address,
          nextKeyLastUpdatedHeight: payload?.nextKey,
          nextKeyId: payload?.nextKeyId,
          tokenId: payload?.token_id,
          owner: payload?.owner,
        },
        operationName: 'queryAssetERC721',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListERC721CollectionByOwner(payload): Observable<any> {
    const operationsDoc = `
    query queryListERC721Collection($owner: String = null)  {
      ${this.envDB} {
        cw721_contract: erc721_contract(where: {erc721_tokens: {owner: {_eq: $owner}}}, order_by: {name: asc}) {
          name
          symbol
          cw721_tokens_aggregate: erc721_tokens_aggregate(where: {owner: {_eq: $owner}}) {
            aggregate {
              count
            }
          }
          smart_contract: evm_smart_contract {
            address
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          owner: payload?.owner,
        },
        operationName: 'queryListERC721Collection',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  countListERC721CollectionByOwner(payload): Observable<any> {
    const operationsDoc = `
    query queryListERC721Collection($owner: String = null)  {
      ${this.envDB} {
        cw721_token_aggregate: erc721_token_aggregate(where: {owner: {_eq: $owner}}) {
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
          owner: payload?.owner,
        },
        operationName: 'queryListERC721Collection',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}
