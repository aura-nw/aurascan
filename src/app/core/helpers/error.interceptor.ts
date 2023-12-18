import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { clearLocalData } from 'src/app/global/global';
import { STORAGE_KEYS } from '../constants/common.constant';
import local from '../utils/storage/local';
import { UserStorage } from '../models/auth.models';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if (err.status === 401 && local.getItem<UserStorage>(STORAGE_KEYS.USER_DATA)?.refreshToken) {
          clearLocalData();
          this.router.navigate(['/login']);
        }
        return throwError(err);
      }),
    );
  }
}
