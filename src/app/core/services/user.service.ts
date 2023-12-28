import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { clearLocalData } from 'src/app/global/global';
import { CW20_TRACKING, CW721_TRACKING, STORAGE_KEYS } from '../constants/common.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { IUser } from '../models/auth.models';
import local from '../utils/storage/local';
import { CommonService } from './common.service';

@Injectable({ providedIn: 'root' })
export class UserService extends CommonService {
  private userSubject$: BehaviorSubject<IUser | null>;

  user$: Observable<IUser | null>;

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
  ) {
    super(http, environmentService);
    this.initUser();
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
      // TODO: Handle null case
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
    query QueryTxOfAccount($startTime: timestamptz = null, $endTime: timestamptz = null, $limit: Int = null, $listTxMsgType: [String!] = null, $listTxMsgTypeNotIn: [String!] = null, $heightGT: Int = null, $heightLT: Int = null, $orderHeight: order_by = desc, $address: String = null) {
      ${this.envDB} {
        transaction(where: {timestamp: {_lte: $endTime, _gte: $startTime}, transaction_messages: {type: {_in: $listTxMsgType, _nin: $listTxMsgTypeNotIn}, sender: {_eq: $address}}, _and: [{height: {_gt: $heightGT, _lt: $heightLT}}]}, limit: $limit, order_by: {height: $orderHeight}) {
          hash
          height
          fee
          timestamp
          code
          transaction_messages {
            type
            content
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
        },
        operationName: 'QueryTxOfAccount',
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
            coin_transfers: {
              _or: [{ from: { _eq: $from } }, { to: { _eq: $to } }]
              block_height: { _lt: $height_lt, _gt: $height_gt }
              transaction: { timestamp: { _lte: $end_time, _gte: $start_time } }
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
          from: payload.from,
          to: payload.to,
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

  getListFTByAddress(payload) {
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
            content
            type
              content
            type
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

  getListNFTByAddress(payload) {
    const operationsDoc = `
    query QueryCW721ListTX($receiver: String = null, $sender: String = null, $startTime: timestamptz = null, $endTime: timestamptz = null, $listTxMsgType: [String!] = null, $listTxMsgTypeNotIn: [String!] = null, $heightGT: Int = null, $heightLT: Int = null, $limit: Int = null, $neqCw4973: String, $actionIn: [String!] = null, $actionNotIn: [String!] = null) {
      ${this.envDB} {
        transaction(where: {cw721_activities: {_or: [{to: {_eq: $receiver}}, {from: {_eq: $sender}}], action: {_in: $actionIn, _nin: $actionNotIn}, cw721_contract: {smart_contract: {name: {_neq: $neqCw4973}}}}, timestamp: {_gte: $startTime, _lte: $endTime}, _and: {height: {_gt: $heightGT, _lt: $heightLT}}, transaction_messages: {type: {_in: $listTxMsgType, _nin: $listTxMsgTypeNotIn}}}, order_by: {height: desc}, limit: $limit) {
          gas_used
          hash
          height
          timestamp
          code
          transaction_messages {
            content
            type
          }
          cw721_activities(where: {_or: [{to: {_eq: $receiver}}, {from: {_eq: $sender}}]}) {
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
          sender: payload.sender,
          receiver: payload.receiver,
          listTxMsgType: payload.listTxMsgType,
          startTime: payload.startTime,
          endTime: payload.endTime,
          heightLT: payload.heightLT,
          actionIn: payload.isNFTDetail ? null : !payload.isTransferTab ? CW721_TRACKING : null,
          actionNotIn: payload.isNFTDetail ? null : payload.isTransferTab ? ['approve', 'instantiate', 'revoke'] : null,
          neqCw4973: 'crates.io:cw4973',
        },
        operationName: 'QueryCW721ListTX',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}
