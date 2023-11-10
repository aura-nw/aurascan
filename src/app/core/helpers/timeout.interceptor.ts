import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { timeout } from 'rxjs/operators';

export const DEFAULT_TIMEOUT = new InjectionToken<number>('defaultTimeout');

@Injectable()
export class RequestTimeoutHttpInterceptor implements HttpInterceptor {
  constructor(@Inject(DEFAULT_TIMEOUT) protected defaultTimeout: number) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const modified = req.clone({
      setHeaders: { 'X-Request-Timeout': `${this.defaultTimeout}` },
    });

    return next.handle(modified).pipe(timeout(this.defaultTimeout));
  }
}
