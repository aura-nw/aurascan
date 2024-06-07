import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { clearLocalData } from 'src/app/global/global';
import { CW20_TRACKING, CW721_TRACKING, ERC721_TRACKING, STORAGE_KEYS } from '../constants/common.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { IUser } from '../models/auth.models';
import local from '../utils/storage/local';

@Injectable({ providedIn: 'root' })
export class UserService {
  private userSubject$: BehaviorSubject<IUser | null>;
  user$: Observable<IUser | null>;

  apiUrl: string;
  graphUrl: string;
  envDB: string;

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
  ) {
    this.initUser();

    this.environmentService.config.subscribe((config) => {
      if (config) {
        const { api } = config;
        this.apiUrl = api.backend;
        this.graphUrl = api.horoscope?.url + api.horoscope?.graphql;
        this.envDB = api.horoscope.chain;
      }
    });
  }

  initUser() {
    const user = local.getItem<IUser>(STORAGE_KEYS.USER_DATA);
    this.userSubject$ = new BehaviorSubject(user || null);

    this.user$ = this.userSubject$.asObservable();
    return user;
  }

  getCurrentUser() {
    if (this.userSubject$) {
      return this.userSubject$?.getValue();
    }

    // Get from local if the userObject$ is not initialized
    return local.getItem<IUser>(STORAGE_KEYS.USER_DATA);
  }

  setUser(user: IUser) {
    if (user) {
      this.userSubject$.next(user);
      local.setItem(STORAGE_KEYS.USER_DATA, user);
    } else {
      this.userSubject$.next(null);
    }
  }

  registerUser(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/register-with-password`, payload);
  }

  loginWithPassword(payload: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login-with-password`, payload);
  }

  changePassword(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/change-password`, payload);
  }

  resendVerifyEmail(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/resend-verification-email/${email}`);
  }

  sendResetPasswordEmail(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/send-reset-password-email/${email}`);
  }

  resetPasswordWithCode(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/reset-password`, payload);
  }

  loginWithGoogle(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/google`, payload);
  }

  refreshToken(payload): Observable<any> {
    this.apiUrl = this.apiUrl || this.environmentService.backend;
    return this.http.post<any>(`${this.apiUrl}/auth/refresh-token`, payload);
  }

  logout() {
    this.setUser(null);
    clearLocalData();
  }

  getListTxByAddress(payload) {
    const operationsDoc = `
    query QueryTxOfAccount($startTime: timestamptz = null, $endTime: timestamptz = null, $limit: Int = null, $listTxMsgType: [String!] = null, $listTxMsgTypeNotIn: [String!] = null, $heightGT: Int = null, $heightLT: Int = null, $orderId: order_by = desc, $address: String! = null) {
      ${this.envDB} {
        transaction(where: {timestamp: {_lte: $endTime, _gte: $startTime}, transaction_messages: {type: {_in: $listTxMsgType, _nin: $listTxMsgTypeNotIn}, sender: {_eq: $address}}, _and: [{height: {_gt: $heightGT, _lt: $heightLT}}]}, limit: $limit, order_by: {id: $orderId}) {
          hash
          height
          fee
          timestamp
          code
          transaction_messages {
            type
            content
          }
          evm_transaction{
            hash
          }
        }
      }
    }
    `;

    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload.limit || 40,
          address: payload.address,
          heightLT: payload.heightLT,
          listTxMsgType: payload.listTxMsgType,
          listTxMsgTypeNotIn: payload.listTxMsgTypeNotIn,
          startTime: payload.startTime,
          endTime: payload.endTime,
          orderId: payload?.orderBy,
        },
        operationName: 'QueryTxOfAccount',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getFirstTxFromAddress(payload) {
    const operationsDoc = `
    query QueryFirstTxFromAddress($address: String!) {
       ${this.envDB} {
        first_cosmos_tx: transaction(
          where: {transaction_messages: {type: {_nregex: "(evm)"}, sender: { _eq: $address}}}
          limit: 1
          order_by: {timestamp: asc}
        ) {
          timestamp
        }
        first_evm_tx: transaction(
          where: {transaction_messages: {type: {_regex: "(evm)"}, sender: { _eq: $address}}}
          limit: 1
          order_by: {timestamp: asc}
        ) {
          timestamp
        }
      }
    }
    `;

    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: payload,
        operationName: 'QueryFirstTxFromAddress',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : {})));
  }

  getListEvmTxByAddress(payload) {
    const operationsDoc = `
    query QueryEvmTxOfAccount($startTime: timestamptz = null, $endTime: timestamptz = null, $limit: Int = null, $orderId: order_by = desc, $address: String! = null) {
      ${this.envDB} {
        evm_transaction(where: {from: {_eq: $address}, transaction: {timestamp: {_gt: $startTime, _lt: $endTime}}}, limit: $limit, order_by: {id: $orderId}) {
          data
          from
          to
          hash
          height
          value
          erc20_activities {
            amount
          }
          transaction {
            timestamp
            hash
          }
        }
      }
    }
    `;

    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload.limit || 40,
          address: payload.address,
          startTime: payload.startTime,
          endTime: payload.endTime,
        },
        operationName: 'QueryEvmTxOfAccount',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListNativeTransfer(payload) {
    const operationsDoc = `
    query CoinTransfer(
      $from: String = null
      $to: String = null
      $start_time: timestamptz = null
      $end_time: timestamptz = null
      $msg_types_in: [String!] = null
      $msg_types_nin: [String!] = null
      $height_gt: Int = null
      $height_lt: Int = null
      $limit: Int = null) {
      ${this.envDB} {
        transaction(
          where: {
            timestamp: { _lte: $end_time, _gte: $start_time }
            coin_transfers: {
              _or: [{ from: { _eq: $from } }, { to: { _eq: $to } }]
              block_height: { _lt: $height_lt, _gt: $height_gt }
              message: { type: { _in: $msg_types_in, _nin: $msg_types_nin } }
            }
          }
          limit: $limit
          order_by: { height: desc }
        ) {
          code
          hash
          timestamp
          height
          transaction_messages {
            type
            content
          }
          coin_transfers(
            where: { _or: [{ from: { _eq: $from } }, { to: { _eq: $to } }] }
          ) {
            from
            to
            amount
            denom
            block_height
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload.limit || 100,
          from: payload.from?.toLowerCase(),
          to: payload.to?.toLowerCase(),
          height_lt: payload.heightLT,
          msg_types_in: payload.listTxMsgTypeNotIn?.length > 0 ? null : payload.listTxMsgType,
          msg_types_nin: payload.listTxMsgTypeNotIn,
          start_time: payload.startTime,
          end_time: payload.endTime,
        },
        operationName: 'CoinTransfer',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getCW20TxByAddress(payload) {
    const operationsDoc = `
    query QueryCW20ListTX(
      $receiver: String = null, 
      $sender: String = null, 
      $heightGT: Int = null, 
      $heightLT: Int = null, 
      $limit: Int = 100, 
      $actionIn: [String!] = null,
      $actionNotIn: [String!] = null,
      $startTime: timestamptz = null, 
      $endTime: timestamptz = null
      ) {
      ${this.envDB} {
        transaction(
          where: {
            cw20_activities: {
              _or: [{to: {_eq: $receiver}}, {from: {_eq: $sender}}], 
              action: {_in: $actionIn, _nin: $actionNotIn}
            },
            height: {_gt: $heightGT, _lt: $heightLT}, 
            timestamp: {_lte: $endTime, _gte: $startTime}
          }, 
          order_by: {height: desc}, 
          limit: $limit) {
            hash
            height
            timestamp
            code
            transaction_messages {
              type
              content
            }
            cw20_activities(where: {_or: [{to: {_eq: $receiver}}, {from: {_eq: $sender}}]}) {
              action
              amount
              from
              to
              sender
              cw20_contract {
                smart_contract {
                  address
                }
                decimal
                symbol
              }
            }
          }
        } 
      }`;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          sender: payload.sender,
          receiver: payload.receiver,
          startTime: payload.startTime,
          endTime: payload.endTime,
          heightLT: payload.heightLT,
          actionIn: CW20_TRACKING,
          actionNotIn: null,
        },
        operationName: 'QueryCW20ListTX',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getErc20TxByAddress(payload) {
    const operationsDoc = `
    query QueryERC20ListTX(
      $from: String = null
      $to: String = null
      $heightGT: Int = null
      $heightLT: Int = null
      $actionIn: [String!] = null
      $actionNotIn: [String!] = null
      $startTime: timestamptz = null
      $endTime: timestamptz = null
      $limit: Int = 100) {
      ${this.envDB} {
        evm_transaction(where: {erc20_activities: {_or: [{from: {_eq: $from}}, {to: {_eq: $to}}], height: {_gt: $heightGT, _lt: $heightLT}, action: {_in: $actionIn, _nin: $actionNotIn}}, transaction: {timestamp: {_lte: $endTime, _gte: $startTime}}}, limit: $limit, order_by: {id: desc}) {
          data
          hash
          transaction {
            timestamp
          }
          erc20_activities(where: {action: {_in: $actionIn, _nin: $actionNotIn} , _or: [{from: {_eq: $from}}, {to: {_eq: $to}}]}) {
            from
            to
            tx_hash
            action
            amount
            erc20_contract {
              symbol
              address
              decimal
            }
            erc20_contract_address
            height
          }
        }
      }
    } `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          from: payload.sender?.toLowerCase(),
          to: payload.receiver?.toLowerCase(),
          startTime: payload.startTime,
          endTime: payload.endTime,
          heightLT: payload.heightLT,
          actionIn: CW20_TRACKING,
          actionNotIn: null,
        },
        operationName: 'QueryERC20ListTX',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListCW721ByAddress(payload) {
    const operationsDoc = `
    query QueryCW721ListTX(
      $receiver: String = null
      $sender: String = null
      $startTime: timestamptz = null
      $endTime: timestamptz = null
      $heightGT: Int = null
      $heightLT: Int = null
      $limit: Int = null
      $neqCw4973: String
      $actionIn: [String!] = null
      $actionNotIn: [String!] = null
    ) {
      ${this.envDB} {
        transaction(
          where: {
            cw721_activities: {
              _or: [{ to: { _eq: $receiver } }, { from: { _eq: $sender } }]
              action: { _in: $actionIn, _nin: $actionNotIn }
              cw721_contract: { smart_contract: { name: { _neq: $neqCw4973 } } }
            }
            timestamp: { _gte: $startTime, _lte: $endTime }
            _and: { height: { _gt: $heightGT, _lt: $heightLT } }
          }
          order_by: [{ id: desc }, {height: desc}]
          limit: $limit
        ) {
          gas_used
          hash
          height
          timestamp
          code
          transaction_messages {
            content
            type
          }
          cw721_activities(
            where: { _or: [{ to: { _eq: $receiver } }, { from: { _eq: $sender } }] }
          ) {
            action
            from
            to
            sender
            cw721_token {
              token_id
            }
            cw721_contract {
              smart_contract {
                address
              }
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
          startTime: payload.startTime,
          endTime: payload.endTime,
          heightLT: payload.heightLT,
          actionIn: CW721_TRACKING,
          actionNotIn: null,
          limit: payload.limit,
          neqCw4973: 'crates.io:cw4973',
        },
        operationName: 'QueryCW721ListTX',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListERC721ByAddress(payload) {
    const operationsDoc = `
    query QueryERC721ListTX(
      $receiver: String = null
      $sender: String = null
      $startTime: timestamptz = null
      $endTime: timestamptz = null
      $heightGT: Int = null
      $heightLT: Int = null
      $limit: Int = null
      $neqCw4973: String
      $actionIn: [String!] = null
      $actionNotIn: [String!] = null
    ) {
      ${this.envDB} {
        evm_transaction(
          where: {
            erc721_activities: {
              _or: [{ to: { _eq: $receiver } }, { from: { _eq: $sender } }]
              action: { _in: $actionIn, _nin: $actionNotIn }
              erc721_contract: { name: { _neq: $neqCw4973 } }
            }
            transaction: {
              timestamp: { _gte: $startTime, _lte: $endTime }
            }
            _and: { height: { _gt: $heightGT, _lt: $heightLT } }
          }
          order_by: [{ id: desc }, {height: desc}]
          limit: $limit
        ) {
          data,
          gas_used: gas
          hash
          height
          value
          transaction {
            timestamp
          }
          transaction_messages: transaction_message {
            content
            type
          }
          transaction_message {
            content
            type
          }
          erc721_activities(
            where: { _or: [{ to: { _eq: $receiver } }, { from: { _eq: $sender } }] }
          ) {
            action
            from
            to
            sender
            erc721_token {
              token_id
            }
            erc721_contract {
              evm_smart_contract {
                address
              }
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
          startTime: payload.startTime,
          endTime: payload.endTime,
          heightLT: payload.heightLT,
          actionIn: ERC721_TRACKING,
          actionNotIn: null, //  ['approve', 'instantiate', 'revoke']
          limit: payload.limit,
          neqCw4973: 'crates.io:cw4973',
        },
        operationName: 'QueryERC721ListTX',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}

