import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { ChainWalletBase, MainWalletBase, State, Wallet } from '@cosmos-kit/core';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import {
  desktopWallets as _desktopWallets,
  mobileWallets as _mobileWallets,
  wcWallets,
} from 'src/app/core/utils/cosmoskit';
import { checkDesktopWallets } from 'src/app/core/utils/cosmoskit/wallets';
@Component({
  selector: 'app-wallet-provider',
  templateUrl: './wallet-provider.component.html',
  styleUrls: ['./wallet-provider.component.scss'],
})
export class WalletProviderComponent implements AfterViewInit {
  @Input() mode: 'MOBILE' | 'DESKTOP';
  @Output() onClose = new EventEmitter<void>();

  chainName = this.environmentService.chainName;

  wallets: (Wallet & { state?: State })[] = [];

  otherWallets: (Wallet & { state?: State })[] = [];

  currentChainWallet: ChainWalletBase;

  isWalletConnectMode = false;
  mobileWallets: ({
    state?: State;
  } & MainWalletBase)[] = _mobileWallets;

  desktopWallets: ({
    walletInfo: {
      state?: State;
    };
  } & MainWalletBase)[] = _desktopWallets;

  wcLogo: string;

  constructor(
    private walletService: WalletService,
    private environmentService: EnvironmentService,
  ) {}

  async ngAfterViewInit() {
    if (this.mode == 'MOBILE') {
      this.wallets = this.mobileWallets.map((w) => w.walletInfo);
    } else {
      const wallets = this.walletService.getWalletRepo().wallets;

      this.wallets = wallets.filter((w) => !w.isModeWalletConnect).map((w) => w.walletInfo);
      const otherWallets = _desktopWallets
        .filter((w) => !checkDesktopWallets(w.walletName) || w.isModeWalletConnect)
        .map((w) => ({ ...w.walletInfo, state: State.Error }));

      this.otherWallets = [...otherWallets, ...wcWallets.map((w) => w.walletInfo)];

      this.wcLogo =
        typeof wcWallets[0].walletInfo.logo == 'string'
          ? wcWallets[0].walletInfo.logo
          : wcWallets[0].walletInfo.logo?.major;
    }
  }

  connect(wallet: Wallet & { state?: State }) {
    this.isWalletConnectMode = wallet.mode == 'wallet-connect';

    if (wallet.state === State.Error) {
      window.open(wallet.downloads[0].link, '_blank');
      return;
    }
    wallet.state = State.Pending;

    this.currentChainWallet = this.walletService.connect(wallet, {
      success: (() => {
        this.isWalletConnectMode = false;
        wallet.state = State.Done;
        this.close();
      }).bind(this),
      error: ((error) => {
        console.error('Connect error: ', error);
        this.isWalletConnectMode = false;
        wallet.state = State.Done;
        this.currentChainWallet = null;
      }).bind(this),
    });
  }

  close() {
    this.onClose.emit(null);
  }
}
