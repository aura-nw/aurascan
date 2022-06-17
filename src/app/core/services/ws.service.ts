import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import io, { Socket } from 'socket.io-client';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';

@Injectable()
export class WSService {
  socketUrl = `${this.environmentService.apiUrl.value.urlSocket}`;

  public wsData: BehaviorSubject<any>;
  public data$: Observable<any>;

  socket: Socket;

  constructor(private environmentService: EnvironmentService) {
    this.wsData = new BehaviorSubject<any>(null);
    this.data$ = this.wsData.asObservable();
  }

  public get wsDataValue() {
    return this.wsData.value;
  }

  public connect(): void {
    this.socket = io(this.socketUrl, {
      path: '/ws/socket.io',
      autoConnect: true,
    });
  }

  public on(name: string, data: any) {
    this.socket.emit(name, data);
    return new Observable((subscriber) => {
      this.socket.on(name, () => {
        this.socket.on(data?.event, (res) => {
          subscriber.next(res);
        });
      });
    });
  }

  public disconnect() {
    this.socket.on('disconnect', (reason) => {
      // ...
    });
  }

  public reconnect() {
    this.socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        this.socket.connect();
      }
      // else the socket will automatically try to reconnect
    });
  }
}
