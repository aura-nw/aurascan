import { Injectable } from '@angular/core';
import { BrowserProvider, JsonRpcProvider, JsonRpcSigner } from 'ethers';
import { BehaviorSubject } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';

@Injectable({
  providedIn: 'root',
})
export class EvmWalletService {
  signer: JsonRpcSigner;
  provider: JsonRpcProvider;

  private _walletSubject$ = new BehaviorSubject(null);

  constructor(private env: EnvironmentService) {}

  async connectWallet() {
    const anyWindow = window as any;

    if (anyWindow?.ethereum) {
      const provider = new BrowserProvider(anyWindow.ethereum);

      this.signer = await provider.getSigner();

      if (this.signer) {
        console.log(this.signer);
      }
    }
  }

  getDefaultProvider() {}
}
