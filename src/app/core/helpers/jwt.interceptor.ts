import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';
import { UserService } from '../services/user.service';
import { NotificationsService } from '../services/notifications.service';
import { Router } from '@angular/router';

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
    const userEmail = localStorage.getItem('userEmail');
    let accessToken = localStorage.getItem('accessToken');
    if (!accessToken || !userEmail) {
      return next.handle(request);
    }

    const jwtToken = this.parseJwt(accessToken);
    if (!this.isReloadToken && jwtToken.exp < Date.now() / 1000) {
      this.isReloadToken = true;
      const payload = {
        refreshToken: localStorage.getItem('refreshToken').replace(/"/g, ''),
      };
      this.userService.refreshToken(payload).subscribe({
        next: (res) => {
          if (res.error?.statusCode === 400) {
            this.isReloadToken = false;
            // remove current fcm token
            this.notificationsService.deleteToken(this.notificationsService.currentFcmToken).subscribe(
              (res) => {},
              () => (this.notificationsService.currentFcmToken = null),
              () => (this.notificationsService.currentFcmToken = null),
            );

            // redirect to log out
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('listNameTag');
            localStorage.removeItem('lstWatchList');
            localStorage.removeItem('registerFCM');
            this.router.navigate(['/login']);

            setTimeout(() => {
              location.reload();
            }, 500);
          }

          localStorage.setItem('accessToken', JSON.stringify(res.accessToken));
          localStorage.setItem('refreshToken', JSON.stringify(res.refreshToken));
          accessToken = res.accessToken;
        },
        error: (err) => {
          this.isReloadToken = false;
          // remove current fcm token
          this.notificationsService.deleteToken(this.notificationsService.currentFcmToken).subscribe(
            (res) => {},
            () => (this.notificationsService.currentFcmToken = null),
            () => (this.notificationsService.currentFcmToken = null),
          );

          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('listNameTag');
          localStorage.removeItem('lstWatchList');
          localStorage.removeItem('registerFCM');
          this.router.navigate(['/login']);

          setTimeout(() => {
            location.reload();
          }, 500);
        },
      });
    }

    if (accessToken && request.url.indexOf(graphUrl) === -1) {
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + accessToken.replace(/"/g, ''),
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
