import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvironmentService } from '../data-services/environment.service';

@Injectable()
export class ChainInfoInterceptor implements HttpInterceptor {
  constructor(private environmentService: EnvironmentService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const isApiBE = req.url.indexOf(this.environmentService.backend) > -1;
    const modified = req.clone({
      setHeaders: isApiBE ? { 'Chain-id': `${this.environmentService.chainId}` } : {},
    });
    return next.handle(modified);
  }
}
