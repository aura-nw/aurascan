import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';
import { UserService } from '../services/user.service';
import { NotificationsService } from '../services/notifications.service';
import { Router } from '@angular/router';
import { clearLocalData } from 'src/app/global/global';
import local from '../utils/storage/local';
import { LOCAL_DATA } from '../constants/common.constant';
import { UserStorage } from '../models/common.model';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  isReloadToken = false;
  constructor(
    private environmentService: EnvironmentService,
    private userService: UserService,
    private notificationsService: NotificationsService,
    private router: Router,
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.environmentService.horoscope) {
      return next.handle(request);
    }
    const graphUrl = `${this.environmentService.horoscope.url + this.environmentService.horoscope.graphql}`;
    // get list name tag if not login email
    const userStorage = local.getItem<UserStorage>(LOCAL_DATA.USER_DATA);
    if (!userStorage) {
      return next.handle(request);
    }

    let jwtToken;
    try {
      jwtToken = this.parseJwt(userStorage.accessToken);
    } catch {
      return next.handle(request);
    }

    if (!this.isReloadToken && jwtToken.exp < Date.now() / 1000) {
      this.isReloadToken = true;
      const payload = {
        refreshToken: userStorage.refreshToken,
      };
      this.userService.refreshToken(payload).subscribe({
        next: (res) => {
          this.isReloadToken = false;
          if (res.error?.statusCode === 400) {
            // remove current fcm token
            this.notificationsService.deleteToken(this.notificationsService.currentFcmToken).subscribe(
              (res) => {},
              () => (this.notificationsService.currentFcmToken = null),
              () => (this.notificationsService.currentFcmToken = null),
            );

            clearLocalData();
            // redirect to log out
            this.router.navigate(['/login']);

            setTimeout(() => {
              location.reload();
            }, 500);
          }

          const userData = {
            email: userStorage.email,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
          };

          local.setItem(LOCAL_DATA.USER_DATA, userData);
        },
        error: (err) => {
          this.isReloadToken = false;
          // remove current fcm token
          this.notificationsService.deleteToken(this.notificationsService.currentFcmToken).subscribe(
            (res) => {},
            () => (this.notificationsService.currentFcmToken = null),
            () => (this.notificationsService.currentFcmToken = null),
          );

          clearLocalData();
          this.router.navigate(['/login']);

          setTimeout(() => {
            location.reload();
          }, 500);
        },
      });
    }

    if (userStorage.accessToken && request.url.indexOf(graphUrl) === -1) {
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + userStorage.accessToken,
        },
      });
    }
    return next.handle(request);
  }

  parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );

    return JSON.parse(jsonPayload);
  }
}
