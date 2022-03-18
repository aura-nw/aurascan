import { Injectable } from "@angular/core";
import { Key } from "@keplr-wallet/types";
import { BehaviorSubject, Observable } from "rxjs";
import {
  KEPLR_ERRORS,
  LAST_USED_PROVIDER,
  WALLET_PROVIDER,
} from "../constants/wallet.constant";
import { WalletStorage } from "../models/wallet";
import { getKeplr } from "../utils/keplr";
import local from "../utils/storage/local";

@Injectable({
  providedIn: "root",
})
export class WalletService {
  // accountObs = n

  wallet$: Observable<Key>;
  private _wallet$: BehaviorSubject<Key>;

  get wallet(): Key {
    return this._wallet$.getValue();
  }

  setWallet(nextState: Key): void {
    this._wallet$.next(nextState);
  }

  constructor() {
    const initialValue: Key = {
      address: null,
      algo: null,
      bech32Address: null,
      isNanoLedger: null,
      name: null,
      pubKey: null,
    };
    this._wallet$ = new BehaviorSubject(null);
    this.wallet$ = this._wallet$.asObservable();
    const lastProvider = local.getItem<WalletStorage>(LAST_USED_PROVIDER);

    if (lastProvider) {
      const { provider, chainId } = lastProvider;
      this.connect(provider, chainId);
    }
  }

  connect(wallet: WALLET_PROVIDER, chainId: string): any {
    switch (wallet) {
      case WALLET_PROVIDER.KEPLR:
        this.connectKeplr(chainId);
        break;
      case WALLET_PROVIDER.COIN98:
        this.connectCoin98(chainId);
        break;
    }
  }

  disconnect(): void {
    this.setWallet(null);

    local.removeItem(LAST_USED_PROVIDER);
  }

  private connectKeplr(chainId: string): KEPLR_ERRORS {
    const checkWallet = async () => {
      try {
        const keplr = await getKeplr();

        if (keplr) {
          await keplr.enable(chainId);

          const account = await keplr.getKey(chainId);

          if (account) {
            this.setWallet(account);
            local.setItem<WalletStorage>(LAST_USED_PROVIDER, {
              provider: WALLET_PROVIDER.KEPLR,
              chainId,
            });
          }

          return KEPLR_ERRORS.Success;
        }
      } catch (e) {
        switch (e) {
          case KEPLR_ERRORS.NoChainInfo:
            console.log(e);
            break;
          case KEPLR_ERRORS.RequestRejected:
            console.log(e);
            break;
          default:
            console.log(e);
        }
        return e;
      }
    };
    checkWallet();
    return KEPLR_ERRORS.Failed;
  }

  private connectCoin98(chainId: string): void {}

  private checkExistedCoin98(): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(false);
    });
  }
}
