import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable()
export class WSservice {
  private subject: WebSocketSubject<any>;
  public dataRealTime: BehaviorSubject<any>;
  public dataob: Observable<any>;

  constructor() {
    // this.connect();
    this.dataRealTime = new BehaviorSubject<any>(null);
    this.dataob = this.dataRealTime.asObservable();
  }
  public get dataValue() {
    return this.dataRealTime.value;
  }
  public connect(url) {
    this.subject = webSocket({
      url: url,
      openObserver: {
        next: () => {
          console.log('connection ---');
        }
      },
      closeObserver: {
        next: () => {
          console.log('disconnect ---');
        }
      }
    });

    this.subject.subscribe(
      res => {
        this.dataRealTime.next(res);
      },
      err => console.log(err),
      () => console.log('complete')
    );
  }

  public on() {
    this.subject.next('');
  }

  public disconnect() {
    this.subject.complete();
  }
}