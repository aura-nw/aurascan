import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { clearLocalData } from 'src/app/global/global';
import { EnvironmentService } from '../data-services/environment.service';
import { NotificationsService } from '../services/notifications.service';
import { UserService } from '../services/user.service';

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
    const user = this.userService.getCurrentUser();
    if (!user) {
      return next.handle(request);
    }

    let jwtToken;
    try {
      jwtToken = this.parseJwt(user.accessToken);
    } catch {
      return next.handle(request);
    }

    if (!this.isReloadToken && jwtToken.exp < Date.now() / 1000) {
      this.isReloadToken = true;
      const payload = {
        refreshToken: user.refreshToken,
      };
      this.userService.refreshToken(payload).subscribe({
        next: (res) => {
          this.isReloadToken = false;
          if (res.error?.statusCode === 400) {
            this.userService.logout();
            // redirect to log out
            this.router.navigate(['/login']);

            setTimeout(() => {
              location.reload();
            }, 500);
          }

          const userData = {
            email: user.email,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
          };

          // local.setItem(STORAGE_KEYS.USER_DATA, userData);
          this.userService.setUser(userData);
        },
        error: (err) => {
          this.isReloadToken = false;

          this.userService.logout();
          this.router.navigate(['/login']);

          setTimeout(() => {
            location.reload();
          }, 500);
        },
      });
    }

    if (user.accessToken && request.url.indexOf(graphUrl) === -1) {
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + user.accessToken,
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
