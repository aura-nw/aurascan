import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnvironmentService } from '../data-services/environment.service';
import { User } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  apiUrl = ``;
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')!));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  /**
   * current user
   */
  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  /**
   * Performs the auth
   * @param email email of user
   * @param password password of user
   */
  login(data) {
    return this.http
      .post<any>(`${this.apiUrl}/auth/login`, data)

      .pipe(
        map((user) => {
          // login successful if there's a jwt token in the response
          if (user && user.data.access_token) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
          return user;
        }),
      );
  }

  change(data) {
    return this.http.post<any>(`${this.apiUrl}/change`, data).pipe(
      map((user) => {
        // login successful if there's a jwt token in the response
        if (user && user.data.access_token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
        return user;
      }),
    );
  }

  /**
   * Logout the user
   */
  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null!);
  }
}
