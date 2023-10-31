import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private environmentService: EnvironmentService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.environmentService.horoscope) {
      return next.handle(request);
    }
    const graphUrl = `${this.environmentService.horoscope.url + this.environmentService.horoscope.graphql}`;
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && request.url.indexOf(graphUrl) === -1) {
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + accessToken.replace(/"/g, ''),
        },
      });
    }
    return next.handle(request);
  }
}
