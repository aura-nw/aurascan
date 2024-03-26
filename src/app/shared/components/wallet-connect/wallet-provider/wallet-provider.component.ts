import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { ChainWalletBase, MainWalletBase, State, Wallet } from '@cosmos-kit/core';
import * as _ from 'lodash';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import {
  desktopWallets as _desktopWallets,
  mobileWallets as _mobileWallets,
  wcWallets,
} from 'src/app/core/utils/cosmoskit';
import { Errors } from 'src/app/core/utils/cosmoskit/constant';
import { checkDesktopWallets } from 'src/app/core/utils/cosmoskit/wallets';
import { getMetamask } from 'src/app/core/utils/ethers/utils';
import { EVM_WALLETS } from 'src/app/core/utils/ethers/wallets';

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

  evmWallets: {
    name: string;
    prettyName: string;
    logo: string;
    downloadInfo?: string;
    state?: State;
  }[] = EVM_WALLETS;

  othersEvmWallet: {
    name: string;
    prettyName: string;
    logo: string;
    downloadInfo?: string;
    state?: State;
  }[];

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
    private toastr: NgxToastrService,
  ) {}

  async ngAfterViewInit() {
    if (this.mode == 'MOBILE') {
      this.wallets = this.mobileWallets.map((w) => w.walletInfo);
      this.evmWallets = EVM_WALLETS;
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

      // Only support Metamask
      if (getMetamask()) {
        this.evmWallets = EVM_WALLETS;
      } else {
        this.evmWallets = [];
        this.othersEvmWallet = EVM_WALLETS;
      }
    }
  }

  connectEvm(wallet) {
    if (wallet) {
      wallet.state = 'Pending';
      this.walletService
        .connectEvmWallet()
        .then(() => {
          wallet.state = 'Done';

          this.close();
        })
        .catch(console.error);
    }
  }

  connect(wallet: Wallet & { state?: State }) {
    this.isWalletConnectMode = wallet.mode == 'wallet-connect' && !this.walletService.isMobile;

    // Only reset pending state
    [...this.otherWallets, ...this.wallets].forEach((wallet) => {
      wallet.state = wallet?.state == State.Pending ? State.Done : wallet.state;
    });

    if (wallet.state === State.Error) {
      window.open(_.get(wallet, 'downloads[0].link'), '_blank');

      this.currentChainWallet = null;
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
        // Throw error if no wallet added
        if (typeof error?.message == 'string' && error?.message?.includes(Errors.NoWalletExists)) {
          this.toastr.error(Errors.NoWalletExists);
        }

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
