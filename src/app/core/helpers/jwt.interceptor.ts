import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable, catchError, map, of, switchMap } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';
import { NotificationsService } from '../services/notifications.service';
import { UserService } from '../services/user.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(
    private environmentService: EnvironmentService,
    private userService: UserService,
    private notificationsService: NotificationsService,
    private router: Router,
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.environmentService.horoscope) {
      return next.handle(request);
    }

    const graphUrl = `${this.environmentService.horoscope.url + this.environmentService.horoscope.graphql}`;

    // get list name tag if not login email
    const user = this.userService.getCurrentUser();
    if (request.url?.indexOf('refresh-token') > -1 || request.url.indexOf(graphUrl) > -1 || !user) {
      return next.handle(request);
    }

    let jwtToken;
    try {
      jwtToken = this.parseJwt(user.accessToken);
    } catch {
      return next.handle(request);
    }

    if (jwtToken.exp >= Date.now() / 1000) {
      if (user.accessToken && request.url.indexOf(graphUrl) === -1) {
        request = request.clone({
          setHeaders: {
            Authorization: 'Bearer ' + user.accessToken,
          },
        });
      }
      return next.handle(request);
    } else {
      const payload = {
        refreshToken: user.refreshToken,
      };

      return this.userService.refreshToken(payload).pipe(
        switchMap((res) => {
          if (res.error?.statusCode === 400) {
            throw new Error(res.error);
          }

          const userData = {
            email: user.email,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
          };
          this.userService.setUser(userData);

          if (userData.accessToken) {
            request = request.clone({
              setHeaders: {
                Authorization: 'Bearer ' + userData.accessToken,
              },
            });
          }
          return next.handle(request);
        }),
        catchError((error) => {
          this.notificationsService.deleteToken();
          this.userService.logout();

          this.router.navigate(['/login']);

          return EMPTY;
        }),
      );
    }
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
