import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { timeout } from 'rxjs/operators';
import { EnvironmentService } from '../data-services/environment.service';

export const DEFAULT_TIMEOUT = new InjectionToken<number>('defaultTimeout');

@Injectable()
export class RequestTimeoutHttpInterceptor implements HttpInterceptor {
  constructor(
    @Inject(DEFAULT_TIMEOUT) protected defaultTimeout: number,
    private _environmentService: EnvironmentService,
  ) {
  }
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const modified = req.clone({
      setHeaders: this.isHeaderNeeded(req?.url) ? { 'X-Request-Timeout': `${this.defaultTimeout}` } : {},
    });
    return next.handle(modified).pipe(timeout(this.defaultTimeout));
  }

  isHeaderNeeded(url: string) {
    if (url?.includes(this._environmentService?.chainInfo?.rest)) {
      return false;
    } else {
      return true;
    }
  }
}
