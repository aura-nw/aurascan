import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { NotificationsService } from '../services/notifications.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private userService: UserService,
    private router: Router,
    private notificationsService: NotificationsService,
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        const error = err?.error?.error?.details;
        // check status unauthorized, refresh token
        if (error?.statusCode === 401 && error?.message == 'Unauthorized') {
          const payload = {
            refreshToken: localStorage.getItem('refreshToken').replace(/"/g, ''),
          };
          this.userService.refreshToken(payload).subscribe({
            next: (res) => {
              if (res.error?.statusCode === 400) {
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
            },
            error: () => {
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
        return throwError(err);
      }),
    );
  }
}
