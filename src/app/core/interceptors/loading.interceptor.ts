import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, finalize } from 'rxjs/operators';
import { NgProgress, NgProgressRef } from 'ngx-progressbar';
import { Router, NavigationStart, Event as NavigationEvent } from '@angular/router';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  numberOfRequest = 0;
  progressRef: NgProgressRef;
  isFirstLoad = false;
  browserRefresh = true;
  constructor(private progress: NgProgress, private router: Router) {
    this.progressRef = this.progress.ref('progressBar');
    this.router.events.pipe(filter( event =>event instanceof NavigationStart))
      .subscribe(
        (event: NavigationEvent) => {
          this.isFirstLoad = true;
          if (event instanceof NavigationStart) {
            this.browserRefresh = false;
          }
      }
    )
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isFirstLoad || this.browserRefresh) {
      this.numberOfRequest++;
      this.progressRef.start();
      this.isFirstLoad = false;
    }

    return next.handle(request).pipe(
      finalize(() => {
        this.numberOfRequest--;
        if (this.numberOfRequest <= 0) {
          this.progressRef.complete();
        }
      })
    );
  }
}
