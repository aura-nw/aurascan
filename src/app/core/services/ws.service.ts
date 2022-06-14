import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import io, { Socket } from 'socket.io-client';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';

@Injectable()
export class WSService {
  public wsData: BehaviorSubject<any>;
  public dataob: Observable<any>;
  socketUrl = `${this.environmentService.apiUrl.value.urlSocket}`;
  currentUser;
  socket: Socket;

  constructor(private environmentService: EnvironmentService) {
    this.wsData = new BehaviorSubject<any>(null);
    this.dataob = this.wsData.asObservable();
    // this.connect();
  }

  public get wsDataValue() {
    return this.wsData.value;
  }

  public connect(): void {
    this.socket = io('https://explorer-api.dev.aura.network', {
      path: '/ws/socket.io',
      autoConnect: true
    });
  }

  public on(name: string, data2: any) {
    this.socket.emit(name, data2);
    return new Observable((subscriber) => {
      this.socket.on(name, (e) => {
        console.log(e);

        this.socket.on(data2?.event, (res) => {
          console.log(res);

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
