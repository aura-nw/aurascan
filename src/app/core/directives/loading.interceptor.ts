import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NgProgress, NgProgressRef } from 'ngx-progressbar';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  numberOfRequest = 0;
  progressRef: NgProgressRef;
  constructor(private progress: NgProgress) {
    this.progressRef = this.progress.ref('progressBar');
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.numberOfRequest++;
    this.progressRef.start();
    return next.handle(request).pipe(
      finalize(() => {
        this.numberOfRequest--;
        if (this.numberOfRequest === 0) {
          this.progressRef.complete();
        }
      })
    );
  }
}
