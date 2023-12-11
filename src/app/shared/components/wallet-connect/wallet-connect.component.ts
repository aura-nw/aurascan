import {Component} from '@angular/core';
import {WalletService} from '../../../core/services/wallet.service';
import {Observable} from "rxjs";
import {CommonService} from "src/app/core/services/common.service";

@Component({
  selector: 'app-wallet-connect',
  templateUrl: './wallet-connect.component.html',
  styleUrls: ['./wallet-connect.component.scss'],
})
export class WalletConnectComponent {
  wallet$: Observable<any> = this.walletService.wallet$;

  constructor(
    private walletService: WalletService,
    public commonService: CommonService,
  ) {
  }

  openWalletPopup(): void {
    this.walletService.openWalletPopup();
  }

  disconnect(): void {
    this.walletService.disconnect();
  }

  copyMessage(text: string) {
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
  }
}
