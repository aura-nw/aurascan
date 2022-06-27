import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import io, { Socket } from 'socket.io-client';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { DialogService } from 'src/app/core/services/dialog.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';

@Injectable({
  providedIn: 'root',
})
export class WSService {
  socketUrl = `${this.environmentService.apiUrl.value.urlSocket}`;

  public wsData: BehaviorSubject<any>;
  public data$: Observable<any>;

  socket: Socket;

  registered = false;

  contractAddress = '';

  constructor(
    private environmentService: EnvironmentService,
    private toastr: NgxToastrService,
    private router: Router,
  ) {
    this.wsData = new BehaviorSubject<any>(null);
    this.data$ = this.wsData.asObservable();
  }

  public get wsDataValue() {
    return this.wsData.value;
  }

  public connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.socketUrl, {
      path: '/ws/socket.io',
      autoConnect: true,
    });
  }

  public on(name: string, data: any): Observable<any> | undefined {
    if (!this.registered) {
      this.socket.emit(name, data);

      this.registered = true;

      return new Observable((subscriber) => {
        this.socket.on(name, () => {
          this.socket.on(data?.event, (res) => {
            subscriber.next(res);
          });
        });
      });
    }

    return undefined;
  }

  public disconnect() {
    this.registered = false;
    this.socket?.on('disconnect', (reason) => {
      // ...
      console.log('reason disconnect', reason);
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

  subscribeVerifyContract(contractAdr: string, tabCallBack?: () => void) {
    this.connect();

    this.contractAddress = contractAdr;

    const wsData = { event: 'eventVerifyContract' };

    const register = this.on('register', wsData);

    if (register === undefined) {
      return;
    }

    register.subscribe((data: any) => {
      const { Verified, ContractAddress } = (data && JSON.parse(data)) || { Verified: false, ContractAddress: '' };

      if (Verified && ContractAddress === this.contractAddress) {
        this.toastr
          .successWithTap('Contract Source Code Verification is successful! Click here to view detail')
          .pipe(take(1))
          .subscribe((_) => {
            tabCallBack && tabCallBack();
          });
      } else {
        this.toastr
          .errorWithTap(
            `Error! Unable to generate Contract Creation Code and Schema for Contract ${this.contractAddress}'`,
          )
          .pipe(take(1))
          .subscribe((_) => {
            tabCallBack && tabCallBack();
          });
      }
    });
  }
}
