import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';
import { map } from 'rxjs/operators';

@Injectable()
export class UserService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  registerUser(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/register-with-password`, payload);
  }

  loginWithPassword(payload): Observable<any> {
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
    return this.http.post<any>(`${this.apiUrl}/auth/refresh-token`, payload);
  }

  getListTxByAddress(payload){
    const operationsDoc = `
    query QueryTxOfAccount(
      $compositeKey: String = null, 
      $address: String = null, 
      $startTime: timestamptz = null,
      $endTime: timestamptz = null,
      $limit: Int = null,
      $listTxMsgType: [String!] = null,
      $heightGT: Int = null,
      $heightLT: Int = null,
      $orderHeight: order_by = desc
    
    ) {
      serenity {
        transaction(
          where: {
            event_attribute_index: {
              composite_key: {_eq: $compositeKey}, 
              value: {_eq: $address}}, 
            timestamp: {_lte: $endTime, _gte: $startTime}
            transaction_messages: {type: {_in: $listTxMsgType}}
            _and: [{height: {_gt: $heightGT, _lt: $heightLT}}]
          },
          limit: $limit,
          order_by: {height: $orderHeight}
        ) {
          hash
          height
          fee
          timestamp
          code
          transaction_messages {
            type
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
          compositeKey: payload.compositeKey || "message.sender",
          address: payload.address,
          heightLT: payload.heightLT
        },
        operationName: 'QueryTxOfAccount',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}
