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
    let accessToken = localStorage.getItem('accessToken');
    const jwtToken = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
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
        error: () => {
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
}
