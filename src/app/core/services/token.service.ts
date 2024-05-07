import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import * as _ from 'lodash';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CW20_TRACKING } from '../constants/common.constant';
import { LCD_COSMOS } from '../constants/url.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable({ providedIn: 'root' })
export class TokenService extends CommonService {
  chainInfo = this.environmentService.chainInfo;
  tokensMarket$ = new BehaviorSubject<any[]>(null);
  nativePrice$ = new BehaviorSubject<number>(null);
  filterBalanceNative$ = new BehaviorSubject<number>(null);
  totalTransfer$ = new BehaviorSubject<number>(null);
  excludedAddresses = this.environmentService.chainConfig.excludedAddresses;

  get tokensMarket() {
    return this.tokensMarket$.getValue();
  }

  get nativePrice() {
    return this.nativePrice$.getValue();
  }

  get filterBalanceNative() {
    return this.filterBalanceNative$.getValue();
  }

  get totalTransfer() {
    return this.totalTransfer$.getValue();
  }

  setTotalTransfer(value: number) {
    this.totalTransfer$.next(value);
  }

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
    private commonService: CommonService,
  ) {
    super(http, environmentService);
  }

  getTokenMarketData(payload = {}): Observable<any> {
    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();

    return this.http.get<any>(`${this.apiUrl}/assets/token-market`, {
      params,
    });
  }

  getCW20Detail(address: string, date): Observable<any> {
    const operationsDoc = `query queryCW20Detail($address: String, $date: date) { 
      ${this.envDB} { smart_contract(where: {address: {_eq: $address}}) {
          address
          cw20_contract {
            name
            symbol
            marketing_info
            decimal
            total_supply
            smart_contract {
              address
            }
            cw20_holders {
              address
              amount
            }
            cw20_total_holder_stats(where: {date: {_gte: $date}}) {
              date
              total_holder
            }
          }
          code {
            code_id_verifications(order_by: {updated_at: desc}) {
              verification_status
            }
          }
        } 
      } 
    }`;

    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          address: address,
          date: date,
        },
        operationName: 'queryCW20Detail',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListCW721Token(payload, textSearch: string = null): Observable<any> {
    let queryUpdate = '';
    if (this.commonService.isValidContract(textSearch)) {
      queryUpdate = 'cw721_contract: {smart_contract: {address: {_eq:' + textSearch + '}}}';
    } else if (textSearch?.length > 0) {
      textSearch = `"%` + textSearch + `%"`;
      queryUpdate = 'cw721_contract: {name: {_ilike:' + textSearch + '}}';
    }
    let querySort = `, order_by: [{${payload.sort_column}: ${payload.sort_order}}, {id: desc}]`;
    const operationsDoc = `
    query queryListCW721($limit: Int = 10, $offset: Int = 0) {
      ${this.envDB} {
        list_token: cw721_contract_stats(limit: $limit, offset: $offset ${querySort}, where: { ${queryUpdate} }) {
          transfer_24h
          total_activity
          cw721_contract {
            name
            symbol
            smart_contract {
              address
            }
          }
        }
        total_token: cw721_contract_stats_aggregate (where: { ${queryUpdate} }) {
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
          limit: payload.limit || 20,
          offset: payload.offset || 0,
        },
        operationName: 'queryListCW721',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListTokenNFTFromIndexer(payload: {
    limit: number;
    offset: number;
    contractAddress: string;
    token_id: string;
    owner: string;
  }): Observable<any> {
    const operationsDoc = `
    query queryListInventory(
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
              smart_contract: { address: { _eq: $contract_address } }
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
        }
        cw721_token_aggregate(
          where: {
          cw721_contract: { 
            smart_contract: { 
              address: { _eq: $contract_address }
            }
          }
          token_id: { _eq: $tokenId }
          owner: { _eq: $owner }
          burned: {_eq: false}
        }
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
          limit: payload?.limit || 20,
          offset: payload.offset,
          contract_address: payload?.contractAddress,
          tokenId: payload?.token_id,
          owner: payload?.owner,
        },
        operationName: 'queryListInventory',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListTokenNFTErc721(payload: {
    limit: number;
    offset: number;
    contractAddress: string;
    token_id: string;
    owner: string;
  }): Observable<any> {
    const operationsDoc = `
    query queryListInventoryErc721(
      $contract_address: String
      $limit: Int = 10
      $tokenId: String = null
      $owner: String = null
      $offset: Int = 0
    ) {
      ${this.envDB} {
        erc721_token(
          limit: $limit
          offset: $offset
          where: {erc721_contract: {evm_smart_contract: {address: {_eq: $contract_address}}}, token_id: {_eq: $tokenId}, owner: {_eq: $owner, _nilike: "0x000000000%"}}
          order_by: [{last_updated_height: desc}, {id: desc}]
        ) {
          id
          token_id
          owner
          media_info
          last_updated_height
          created_at
        }
        erc721_token_aggregate(
          where: {erc721_contract: {evm_smart_contract: {address: {_eq: $contract_address}}}, token_id: {_eq: $tokenId}, owner: {_eq: $owner, _nilike: "0x000000000%"}}
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
          limit: payload?.limit || 20,
          offset: payload.offset,
          contract_address: payload?.contractAddress,
          tokenId: payload?.token_id,
          owner: payload?.owner,
        },
        operationName: 'queryListInventoryErc721',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  countTotalTokenCW721(contract_address: string): Observable<any> {
    const operationsDoc = `
    query queryCountTotalToken721($contract_address: String) {
      ${this.envDB} {
        cw721_token_aggregate(where: {cw721_contract: {smart_contract: {address: {_eq: $contract_address}}}, burned: {_eq: false}}) {
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
          contract_address: contract_address,
        },
        operationName: 'queryCountTotalToken721',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  countTotalTokenERC721(contract_address: string): Observable<any> {
    const operationsDoc = `
    query queryCountTotalTokenErc721($contract_address: String) {
      ${this.envDB} {
        erc721_token_aggregate(
          where: {erc721_contract: {evm_smart_contract: {address: {_eq: $contract_address}}}, owner: {_nilike: "0x000000000%"}}
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
          contract_address: contract_address,
        },
        operationName: 'queryCountTotalTokenErc721',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }


  getListTokenHolder(limit: string | number, offset: string | number, contractAddress: string): Observable<any> {
    const operationsDoc = `query queryCW20ListHolder($address: String, $limit: Int, $offset: Int) {
      ${this.envDB} {
        cw20_holder(where: {cw20_contract: {smart_contract: {address: {_eq: $address}}}, amount: {_gt: "0"}}, limit: $limit, offset: $offset, order_by: {amount: desc}) {
          amount
          address
          cw20_contract {
            total_supply
            decimal
          }
        }
        cw20_holder_aggregate(where: {cw20_contract: {smart_contract: {address: {_eq: $address}}}, amount: {_gt: "0"}}) {
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
          address: contractAddress,
        },
        operationName: 'queryCW20ListHolder',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListTokenHolderNFT(payload: { limit: string | number; offset?: string | number; contractAddress: string }) {
    const operationsDoc = `
    query queryListHolderNFT($contract_address: String, $limit: Int = 10, $offset: Int) {
      ${this.envDB} {
        view_count_holder_cw721(limit: $limit, offset: $offset, where: {contract_address: {_eq: $contract_address}}, order_by: {count: desc}) {
          count
          owner
        }
        view_count_holder_cw721_aggregate(where: {contract_address: {_eq: $contract_address}}) {
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
          limit: payload?.limit || 20,
          offset: payload.offset || 0,
          contract_address: payload?.contractAddress,
        },
        operationName: 'queryListHolderNFT',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListAssetCommunityPool() {
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.DISTRIBUTION}`);
  }

  getCW721Transfer(payload: {
    isCW4973?: boolean;
    isNFTDetail?: boolean;
    contractAddr?: string;
    sender?: string;
    receiver?: string;
    tokenId?: string;
    idLte?: string;
    txHash?: string;
  }): Observable<any> {
    let queryName = payload.isCW4973 ? 'CW4973Transfer' : 'CW721Transfer';
    let queryCondition = payload.isCW4973 ? '_eq' : '_neq';
    let queryActionNotIn = payload.isNFTDetail
      ? ['']
      : ['approve', 'instantiate', 'revoke', 'approve_all', 'revoke_all', ''];
    const operationsDoc = `query ${queryName}(
      $contractAddress: String = null
      $actionNotIn: [String!] = null
      $idLte: Int = null
      $idGte: Int = null
      $receiver: String = null
      $sender: String = null
      $tokenId: String = null
      $txHash: String = null) {
      ${this.envDB} {
        cw721_activity(
          where: {
            _or: [{ to: { _eq: $receiver } }, { from: { _eq: $sender } }]
            cw721_contract: {
              smart_contract: {
                address: { _eq: $contractAddress }
                name: { ${queryCondition}: "crates.io:cw4973" }
              }
            }
            cw721_token: { token_id: { _eq: $tokenId } }
            id: { _lte: $idLte, _gte: $idGte }
            action: { _nin: $actionNotIn }
            tx_hash: {_eq: $txHash}
          }
          order_by: { id: desc }
        ) {
          id
          action
          from
          to
          sender
          cw721_token {
            token_id
            cw721_contract {
              smart_contract {
                address
              }
            }
          }
          tx {
            hash
            height
            timestamp
            code
            transaction_messages {
              content
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
          contractAddress: payload.contractAddr,
          actionNotIn: queryActionNotIn,
          sender: payload.sender,
          receiver: payload.receiver,
          tokenId: payload.tokenId,
          idLte: payload.idLte,
          txHash: payload.txHash,
        },
        operationName: queryName,
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getERC721Transfer(payload: {
    isNFTDetail?: boolean;
    contractAddr?: string;
    sender?: string;
    receiver?: string;
    tokenId?: string;
    idLte?: string;
    txHash?: string;
  }): Observable<any> {
    let queryName = 'ERC721Transfer';
    let queryActionNotIn = payload.isNFTDetail
      ? ['']
      : ['approve', 'instantiate', 'revoke', 'approve_all', 'revoke_all', ''];
    const operationsDoc = `query ${queryName}(
      $contractAddress: String = null
      $actionNotIn: [String!] = null
      $idLte: Int = null
      $idGte: Int = null
      $receiver: String = null
      $sender: String = null
      $tokenId: String = null
      $txHash: String = null) {
      ${this.envDB} {
        erc721_activity(
          where: {_or: [{to: {_eq: $receiver}}, {from: {_eq: $sender}}], erc721_contract: {evm_smart_contract: {address: {_eq: $contractAddress}}}, erc721_token: {token_id: {_eq: $tokenId}}, id: {_lte: $idLte, _gte: $idGte}, action: {_nin: $actionNotIn}, tx_hash: {_eq: $txHash}}
          order_by: {id: desc}
        ) {
          id
          action
          from
          to
          sender
          erc721_token {
            token_id
            erc721_contract {
              evm_smart_contract {
                address
              }
            }
          }
          evm_transaction {
            hash
            height
            data
            transaction {
              code
              timestamp
            }
            transaction_message {
              content
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
          contractAddress: payload.contractAddr,
          actionNotIn: queryActionNotIn,
          sender: payload.sender,
          receiver: payload.receiver,
          tokenId: payload.tokenId,
          idLte: payload.idLte,
          txHash: payload.txHash,
        },
        operationName: queryName,
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }


  getCW20Transfer(payload): Observable<any> {
    const operationsDoc = `query queryListTxsCW20(
      $receiver: String = null
      $sender: String = null
      $contractAddr: String = null
      $heightGT: Int = null
      $heightLT: Int = null
      $limit: Int = 100
      $txHash: String = null
      $actionIn: [String!] = null
      $actionNotIn: [String!] = null) {
      ${this.envDB} {
        cw20_activity(
          where: {
            _or: [{ to: { _eq: $receiver } }, { from: { _eq: $sender } }]
            cw20_contract: { smart_contract: { address: { _eq: $contractAddr } } }
            action: { _in: $actionIn, _nin: $actionNotIn }
            height: { _gt: $heightGT, _lt: $heightLT }
            tx_hash: { _eq: $txHash }
          }
          order_by: { height: desc }
          limit: $limit
        ) {
          action
          amount
          from
          to
          sender
          height
          cw20_contract {
            smart_contract {
              address
            }
            decimal
            symbol
          }
          tx {
            hash
            height
            timestamp
            code
            transaction_messages {
              type
              content
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
          sender: payload.sender,
          receiver: payload.receiver,
          listTxMsgType: payload.listTxMsgType,
          contractAddr: payload.contractAddr,
          heightLT: payload.heightLT,
          txHash: payload.txHash,
          actionIn: CW20_TRACKING,
          actionNotIn: null,
        },
        operationName: 'queryListTxsCW20',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getCoinData() {
    this.http.get<any>(`${this.apiUrl}/assets/token-market`).subscribe((res) => {
      let nativeToken = res?.find((k) => k.coinId === this.environmentService.coingecko?.ids[0]);
      this.nativePrice$.next(nativeToken?.currentPrice);
      this.tokensMarket$.next(res);
    });
  }

  getListTransactionTokenIBC(payload: {
    denom: string;
    limit: number;
    offset: number;
    address: string;
    txHash?: string;
  }): Observable<any> {
    const operationsDoc = `
    query queryListTxIBC($denom: String = null, $limit: Int = null, $offset: Int = null, $address: String = null, $hash: String =null) {
      ${this.envDB} {
        ibc_ics20(where: {denom: {_eq: $denom}, _or: [{receiver: {_eq: $address}}, {sender: {_eq: $address}}], ibc_message: {tx_hash: {_eq: $hash}}}, limit: $limit, offset: $offset) {
          denom
          sender
          receiver
          amount
          ibc_message {
            transaction {
              hash
              transaction_messages {
                type
                content
              }
              timestamp
              code
            }
          }
        }
        ibc_ics20_aggregate(where: {denom: {_eq: $denom}, _or: [{receiver: {_eq: $address}}, {sender: {_eq: $address}}], ibc_message: {tx_hash: {_eq: $hash}}}) {
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
          denom: payload.denom,
          limit: payload.limit,
          offset: payload.offset,
          address: payload.address,
          hash: payload.txHash,
        },
        operationName: 'queryListTxIBC',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getNativeHolder(payload: { limit?: number; offset?: number; address?: string }): Observable<any> {
    const operationsDoc = `
    query queryTokenHolder($limit: Int = null, $offset: Int = null, $address: String = null) {
      ${this.envDB} {
        m_view_account_balance_statistic(where: {address: {_eq: $address}, amount: {_gt: "0"}}, limit: $limit, offset: $offset, order_by: {amount: desc}) {
          updated_at
          amount
          address
        }
        m_view_account_balance_statistic_aggregate (where: {address: {_eq: $address}, amount: {_gt: "0"}}) {
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
          address: payload.address || null,
          limit: payload.limit || 100,
          offset: payload.offset || 0,
        },
        operationName: 'queryTokenHolder',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getDenomHolder(payload: {
    denomHash: string;
    limit?: number;
    offset?: number;
    address?: string;
    isExcludedAddresses?: boolean;
  }): Observable<any> {
    const operationsDoc = `
    query queryHolderDenom($denom: String = null, $limit: Int = null, $offset: Int = null, $address: String = null, $addressNotIn: [String!] = null) {
      ${this.envDB} {
        account_balance(where: {account: {address: {_eq: $address, _nin: $addressNotIn}}, amount: {_gt: "0"}, denom: {_eq: $denom}}, limit: $limit, offset: $offset, order_by: {amount: desc}) {
          account {
            address
            evm_address
          }
          amount
        }
        account_balance_aggregate (where: {account: {address: {_eq: $address}}, amount: {_gt: "0"}, denom: {_eq: $denom}}) {
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
          denom: payload.denomHash,
          address: payload.address || null,
          limit: payload.limit || 100,
          offset: payload.offset || 0,
          addressNotIn: payload.isExcludedAddresses ? this.excludedAddresses : [],
        },
        operationName: 'queryHolderDenom',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getTokenSupply() {
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.SUPPLY}`);
  }

  getAmountNative(address: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/account/${address}`).pipe(catchError((_) => of([])));
  }

  getListAmountNative(address: string[]): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/account/list/${address}`).pipe(catchError((_) => of([])));
  }

  getListToken(payload): Observable<any> {
    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();

    return this.http.get<any>(`${this.apiUrl}/assets`, {
      params,
    });
  }

  getTokenDetail(denom): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/assets/${denom}`);
  }

  getEvmTokenDetail(payload: { address?: string }): Observable<any> {
    const operationsDoc = `
    query getEvmTokenDetail($address: String = null) {
      ${this.envDB} {
        erc20_contract(limit: 1, where: {address: {_eq: $address}}) {
          id
          decimal
          address
          evm_smart_contract_id
          last_updated_height
          name
          symbol
          total_supply
          evm_smart_contract {
            evm_contract_verifications(order_by: {id: desc}) {
              status
            }
          }
          erc20_activities {
            amount
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          address: payload.address?.toLowerCase(),
        },
        operationName: 'getEvmTokenDetail',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getEvmNftDetail(payload: { address: string }): Observable<any> {
    const operationsDoc = `
    query getEvmNftDetail($address: String = null) {
      ${this.envDB} {
        evm_smart_contract(limit: 1, where: {address: {_eq: $address}}) {
          id
          address
          creator
          evm_contract_verifications(order_by: {id: desc}) {
            status
          }
          erc721_contract {
            name
            symbol
          }
        }
      }
    }
    `;


    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          address: payload.address?.toLowerCase(),
        },
        operationName: 'getEvmNftDetail',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getERC20Transfer(payload): Observable<any> {
    const operationsDoc = `query queryListTxsERC20(
      $receiver: String = null
      $sender: String = null
      $contractAddr: String = null
      $heightGT: Int = null
      $heightLT: Int = null
      $limit: Int = 100
      $txHash: String = null
      $actionIn: [String!] = null
      $actionNotIn: [String!] = null) {
      ${this.envDB} {
        erc20_activity(where: {_or: [{to: {_eq: $receiver}}, {from: {_eq: $sender}}], erc20_contract_address: {_eq: $contractAddr}, action: {_in: $actionIn, _nin: $actionNotIn}, height: {_gt: $heightGT, _lt: $heightLT}, tx_hash: {_eq: $txHash}}, order_by: {height: desc}, limit: $limit) {
          action
          amount
          from
          to
          sender
          height
          erc20_contract_address
          erc20_contract {
            decimal
            symbol
          }
          tx_hash
          evm_transaction {
            data
            transaction {
              timestamp
              code
            }
            transaction_message {
              type
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
          sender: payload.sender?.toLowerCase(),
          receiver: payload.receiver?.toLowerCase(),
          listTxMsgType: payload.listTxMsgType,
          contractAddr: payload.contractAddr?.toLowerCase(),
          heightLT: payload.heightLT,
          txHash: payload.txHash,
          actionIn: CW20_TRACKING,
          actionNotIn: null,
        },
        operationName: 'queryListTxsERC20',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}
