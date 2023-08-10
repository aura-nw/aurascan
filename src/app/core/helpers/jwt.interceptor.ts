import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + accessToken.replace(/"/g, ''),
          'x-hasura-admin-secret': 'abc@123', 'Hasura-Client-Name': 'hasura-console'
        },
      });
    } else {
      request = request.clone({
        setHeaders: {
           'x-hasura-admin-secret': 'abc@123', 'Hasura-Client-Name': 'hasura-console'
        },
      });
    }
    return next.handle(request);
  }
}
