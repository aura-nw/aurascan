import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { ChainWalletBase, Wallet } from '@cosmos-kit/core';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { desktopWallets, mobileWallets, wcWallets } from 'src/app/core/utils/cosmoskit';
@Component({
  selector: 'app-wallet-provider',
  templateUrl: './wallet-provider.component.html',
  styleUrls: ['./wallet-provider.component.scss'],
})
export class WalletProviderComponent implements AfterViewInit {
  @Input() mode: 'MOBILE' | 'DESKTOP';
  @Output() onClose = new EventEmitter<void>();

  chainName = this.environmentService.chainName;

  wallets: Wallet[] = [];

  otherWallets: Wallet[] = [];

  currentChainWallet: ChainWalletBase;

  isWalletConnectMode = false;

  constructor(
    private walletService: WalletService,
    private environmentService: EnvironmentService,
  ) {}

  async ngAfterViewInit() {
    if (this.mode == 'MOBILE') {
      this.wallets = mobileWallets.map((w) => w.walletInfo);
    } else {
      this.wallets = desktopWallets.map((w) => w.walletInfo);
      this.otherWallets = wcWallets.map((w) => w.walletInfo);
    }
  }

  isWalletNotExited(wallet: Wallet) {
    return !this.walletService.wallets.find((w) => w.walletName == wallet.name);
  }

  isWalletPending(wallet: Wallet) {
    try {
      const chainWallet = this.walletService.getChainWallet(wallet.name);

      return chainWallet?.state == 'Pending';
    } catch (error) {
      return false;
    }
  }

  connect(wallet: Wallet) {
    this.isWalletConnectMode = wallet.mode == 'wallet-connect';

    this.currentChainWallet = this.walletService.connect(wallet, {
      success: (() => {
        this.isWalletConnectMode = false;
        this.close();
      }).bind(this),
      error: ((error) => {
        console.error('Connect error: ', error);
        this.isWalletConnectMode = false;
        this.currentChainWallet = null;
      }).bind(this),
    });
  }

  close() {
    this.onClose.emit(null);
  }
}
