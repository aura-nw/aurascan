import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { ChainWalletBase, State, Wallet } from '@cosmos-kit/core';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { WalletsService } from 'src/app/core/services/wallets.service';
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

  constructor(
    private walletService: WalletsService,
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
    return this.walletService.wallets.find((w) => w.walletName == wallet.name)?.clientMutable.state == State.Error;
  }

  stateOfWallet(wallet: Wallet) {
    return this.walletService.getChainWallet(wallet.name)?.state;
  }

  connect(wallet: Wallet) {
    this.currentChainWallet = this.walletService.connect(
      wallet,
      (() => {
        this.close();
      }).bind(this),
    );
  }

  close() {
    this.onClose.emit(null);
  }
}
