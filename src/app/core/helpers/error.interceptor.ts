import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from '../services/user.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private userService: UserService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        // check status unauthorized, refresh token
        if (err?.error?.statusCode === 401 && err?.error?.message != 'Incorrect old password.') {
          const payload = {
            refreshToken: localStorage.getItem('refreshToken').replace(/"/g, ''),
          };
          this.userService.refreshToken(payload).subscribe((res) => {
            localStorage.setItem('accessToken', JSON.stringify(res.accessToken));
            localStorage.setItem('refreshToken', JSON.stringify(res.refreshToken));
          });
        }
        const error = err.error || err.statusText;
        return throwError(error);
      }),
    );
  }
}
