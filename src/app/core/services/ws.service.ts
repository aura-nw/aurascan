import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import io, { Socket } from 'socket.io-client';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { SoulboundService } from './soulbound.service';
import { WalletService } from './wallet.service';

interface RedisResponse {
  Code: string;
  Message: string;
  ContractAddress: string;
  Verified: boolean;
  CodeId: number;
  ReceiverAddress: string;
}
@Injectable({
  providedIn: 'root',
})
export class WSService {
  socketUrl = `${this.environmentService.socketUrl}`;

  public wsData: BehaviorSubject<any>;
  public data$: Observable<any>;
  private codeStatus = new BehaviorSubject<any>(null);
  private notifyValue = new BehaviorSubject<any>(null);

  socket: Socket;

  registered = false;

  codeId: number;

  constructor(
    private environmentService: EnvironmentService,
    private soulboundService: SoulboundService,
    private walletService: WalletService,
  ) {
    this.wsData = new BehaviorSubject<any>(null);
    this.data$ = this.wsData.asObservable();
  }

  public get wsDataValue() {
    return this.wsData.value;
  }

  public get getCodeStatus() {
    return this.codeStatus.asObservable();
  }

  public get getNotifyValue() {
    return this.notifyValue.asObservable();
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

  subscribeVerifyContract(codeId: number, callBack?: () => void, tabCallBack?: () => void) {
    this.connect();

    this.codeId = codeId;

    const wsData = { event: 'eventVerifyContract' };

    const register = this.on('register', wsData);

    if (register === undefined) {
      return;
    }

    register.subscribe((data: any) => {
      let resMessages = '';
      const redisResponse: RedisResponse = (data && JSON.parse(data)) || {
        Code: '',
        Message: '',
        Verified: false,
        ContractAddress: null,
        CodeId: null,
      };

      if (redisResponse.CodeId === this.codeId && this.codeId) {
        callBack && callBack();
        this.codeStatus.next(redisResponse.Code);
      }
    });
  }

  subscribeABTNotify(callBack?: () => void, tabCallBack?: () => void) {
    this.connect();

    const wsData = { event: 'eventABTNotify' };

    const register = this.on('register', wsData);

    if (register === undefined) {
      return;
    }

    register.subscribe((data: any) => {
      const redisResponse: RedisResponse = (data && JSON.parse(data)) || {
        ReceiverAddress: '',
      };

      const currentWallet = this.walletService.wallet?.bech32Address;
      if (currentWallet && redisResponse.ReceiverAddress === currentWallet) {
        callBack && callBack();
        this.soulboundService.getNotify(currentWallet).subscribe((res) => {
          this.notifyValue.next(res.data.notify);
        });
      }
    });
  }
}
