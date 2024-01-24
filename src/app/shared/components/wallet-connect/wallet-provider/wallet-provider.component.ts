import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ChainWalletBase, State, Wallet, WalletAccount } from '@cosmos-kit/core';
import { WalletsService } from 'src/app/core/services/wallets.service';
import { wallets as WCWallets } from 'src/app/core/utils/wallets/wallet-connect/wc';
import { wallets as coin98Wallets } from '@cosmos-kit/coin98';
import { wallets as keplrWallets } from '@cosmos-kit/keplr';
import { wallets as leapWallets } from '@cosmos-kit/leap';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
@Component({
  selector: 'app-wallet-provider',
  templateUrl: './wallet-provider.component.html',
  styleUrls: ['./wallet-provider.component.scss'],
})
export class WalletProviderComponent implements AfterViewInit {
  @Output() onClose = new EventEmitter<WalletAccount>();

  chainName = this.environmentService.chainName;

  wallets = [...coin98Wallets, ...keplrWallets, ...leapWallets]
    .filter((w) => w.isModeExtension)
    .map((w) => w.walletInfo);

  otherWallets = WCWallets.map((w) => w.walletInfo);

  currentChainWallet: ChainWalletBase;

  constructor(
    private walletService: WalletsService,
    private environmentService: EnvironmentService,
  ) {}

  ngAfterViewInit(): void {
    this.walletService.walletManager.isWalletNotExist;
  }

  isWalletNotExited(wallet: Wallet) {
    return this.walletService.wallets.find((w) => w.walletName == wallet.name)?.clientMutable.state == State.Error;
  }

  connect(wallet: Wallet) {
    this.currentChainWallet = this.walletService.getChainWallet(wallet.name);

    this.currentChainWallet
      ?.connect()
      .then(() => {
        return this.currentChainWallet.client.getAccount(this.currentChainWallet.chainId);
      })
      .then((account) => {
        console.log(account);
      })
      .catch((e) => {
        console.error(e);
      });
  }

  getLogo(wallet: Wallet) {
    return typeof wallet.logo == 'string' ? wallet.logo : wallet.logo.major;
  }

  close() {
    this.onClose.emit(null);
  }
}
