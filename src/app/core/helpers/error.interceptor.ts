import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private userService: UserService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        // check status unauthorized, refresh token
        if (err?.error?.statusCode === 401 && err?.error?.message == 'Unauthorized') {
          const payload = {
            refreshToken: localStorage.getItem('refreshToken').replace(/"/g, ''),
          };
          this.userService.refreshToken(payload).subscribe({
            next: (res) => {
              if (res.error?.statusCode === 400) {
                // redirect to log out
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userEmail');
                this.router.navigate(['/login']);

                setTimeout(() => {
                  location.reload();
                }, 500);
              }

              localStorage.setItem('accessToken', JSON.stringify(res.accessToken));
              localStorage.setItem('refreshToken', JSON.stringify(res.refreshToken));
            },
            error: () => {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('userEmail');
              this.router.navigate(['/login']);

              setTimeout(() => {
                location.reload();
              }, 500);
            },
          });
        }
        const error = err.error || err.statusText;
        return throwError(error);
      }),
    );
  }
}
