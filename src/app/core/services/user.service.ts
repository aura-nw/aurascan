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
      $listTxMsgType: [String!] = null
    ) {
      serenity {
        transaction(
          where: {
            event_attribute_index: {
              composite_key: {_eq: $compositeKey}, 
              value: {_eq: $address}}, 
            timestamp: {_lte: $endTime, _gte: $startTime}
            transaction_messages: {type: {_in: $listTxMsgType}}},
          limit: $limit
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
          "limit": 20,
          "compositeKey": null,
          "startTime": "2023-08-01",
          "endTime": "2023-08-08",
          "address": 'aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx',
          "listTxMsgType": null
        },
        operationName: 'QueryTxOfAccount',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}
