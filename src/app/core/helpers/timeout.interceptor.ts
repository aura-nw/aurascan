import { Injectable, InjectionToken, Inject } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { empty, TimeoutError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

export const DEFAULT_TIMEOUT = new InjectionToken<number>('defaultTimeout');

@Injectable({
  providedIn: 'root',
})
export class RequestTimeoutHttpInterceptor implements HttpInterceptor {
  constructor(@Inject(DEFAULT_TIMEOUT) protected defaultTimeout: number) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const modified = req.clone({
      setHeaders: { 'X-Request-Timeout': `${this.defaultTimeout}` },
    });

    return next.handle(modified).pipe(
      timeout(this.defaultTimeout),
      catchError((err) => {
        if (err instanceof TimeoutError) console.error('Timeout has occurred', req.url);
        return empty();
      }),
    );
  }
}
