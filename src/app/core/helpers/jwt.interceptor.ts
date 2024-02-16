import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable, catchError, switchMap } from 'rxjs';
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

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.environmentService.config) {
      return next.handle(request);
    }

    // get list name tag if not login email
    const user = this.userService.getCurrentUser();
    const isApiBE = request.url.indexOf(this.environmentService.backend) > -1;
    if (!isApiBE || !user?.accessToken || request.url?.indexOf('refresh-token') > -1) {
      return next.handle(request);
    }

    let jwtToken;
    try {
      jwtToken = this.parseJwt(user?.accessToken);
    } catch {
      return EMPTY;
    }

    if (jwtToken.exp >= Date.now() / 1000) {
      if (user.accessToken) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${user.accessToken}`,
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

          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${userData.accessToken}`,
            },
          });
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
