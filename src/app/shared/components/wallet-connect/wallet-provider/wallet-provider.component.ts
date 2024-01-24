import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ChainWalletBase, State, Wallet, WalletAccount } from '@cosmos-kit/core';
import { WalletsService } from 'src/app/core/services/wallets.service';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { coin98wallets, keplrWallets, leapWallets, wcWallets } from 'src/app/core/utils/wallets';
@Component({
  selector: 'app-wallet-provider',
  templateUrl: './wallet-provider.component.html',
  styleUrls: ['./wallet-provider.component.scss'],
})
export class WalletProviderComponent implements AfterViewInit {
  @Output() onClose = new EventEmitter<WalletAccount>();

  chainName = this.environmentService.chainName;

  wallets = [...coin98wallets, ...keplrWallets, ...leapWallets]
    .filter((w) => w.isModeExtension)
    .map((w) => w.walletInfo);

  otherWallets = wcWallets.map((w) => w.walletInfo);

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
        if (account) {
          this.onClose.emit(account);
        }
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
