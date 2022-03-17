import { Injectable } from "@angular/core";
import { KEPLR_ERRORS, WALLET_PROVIDER } from "../constants/wallet.constant";
import { getKeplr } from "../utils/keplr";

@Injectable({
  providedIn: "root",
})
export class WalletService {
  constructor() {}

  connect(wallet: WALLET_PROVIDER, chainId: string): void {
    switch (wallet) {
      case WALLET_PROVIDER.KEPLR:
        this.connectKeplr(chainId);
        break;
      case WALLET_PROVIDER.COIN98:
        this.connectCoin98(chainId);
        break;
    }
  }

  private connectKeplr(chainId: string): KEPLR_ERRORS {
    const checkWallet = async () => {
      try {
        const keplr = await getKeplr();

        if (keplr) {
          await keplr.enable(chainId);
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
