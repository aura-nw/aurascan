import { getKeplrFromWindow } from '@keplr-wallet/stores';
import { Keplr } from '@keplr-wallet/types';
import { KeplrWalletConnectV1 } from '@keplr-wallet/wc-client';
import { isAndroid as checkIsAndroid, isMobile as checkIsMobile } from '@walletconnect/browser-utils';
import WalletConnect from '@walletconnect/client';
import { IJsonRpcRequest } from '@walletconnect/types';

export class WalletManager {
  protected walletConnector: WalletConnect | undefined;
  autoConnectingWalletType: string;
  protected onBeforeSendRequest = (request: Partial<IJsonRpcRequest>): void => {
    if (!checkIsMobile()) {
      return;
    }

    const deepLink = checkIsAndroid()
      ? 'intent://wcV1#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;'
      : 'keplrwallet://wcV1';

    switch (request.method) {
      case 'keplr_enable_wallet_connect_v1':
        // Keplr mobile requests another per-chain permission for each wallet connect session.
        // By the current logic, `enable()` is requested immediately after wallet connect is connected.
        // However, in this case, two requests are made consecutively.
        // So in ios, the deep link modal pops up twice and confuses the user.
        // To solve this problem, enable on the osmosis chain does not open deep links.
        if (
          request.params &&
          request.params.length === 1 /* && request.params[0] === this.chainStore.current.chainId */
        ) {
          break;
        }
        window.location.href = deepLink;
        break;
      case 'keplr_sign_amino_wallet_connect_v1':
        window.location.href = deepLink;
        break;
    }

    return;
  };
  getKeplr = (): Promise<Keplr | undefined> => {
    const connectingWalletType = 'wallet-connect';
      // localStorage?.getItem(KeyAutoConnectingWalletType) || localStorage?.getItem(KeyConnectingWalletType);

    if (connectingWalletType === 'wallet-connect') {
      if (!this.walletConnector) {
          this.walletConnector = new WalletConnect({
              bridge: 'https://bridge.walletconnect.org',
              signingMethods: [],
              qrcodeModal: new WalletConnectQRCodeModalV1Renderer(),
          });
          // XXX: I don't know why they designed that the client meta options in the constructor should be always ingored...
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.walletConnector._clientMeta = {
              name: 'Osmosis',
              description: 'Osmosis is the first IBC-native Cosmos interchain AMM',
              url: 'https://app.osmosis.zone',
              icons: [window.location.origin + '/public/assets/osmosis-wallet-connect.png'],
          };

        //   this.walletConnector!.on('disconnect', this.onWalletConnectDisconnected);
      }

      if (!this.walletConnector.connected) {
        return new Promise<Keplr | undefined>((resolve, reject) => {
          this.walletConnector!.connect()
            .then(() => {
              localStorage?.removeItem(KeyConnectingWalletType);
              localStorage?.setItem(KeyAutoConnectingWalletType, 'wallet-connect');
              this.autoConnectingWalletType = 'wallet-connect';

              resolve(
                new KeplrWalletConnectV1(this.walletConnector!, {
                  onBeforeSendRequest: this.onBeforeSendRequest,
                }),
              );
            })
            .catch((e) => {
              console.log(e);
              // XXX: Due to the limitation of cureent account store implementation.
              //      We shouldn't throw an error (reject) on the `getKeplr()` method.
              //      So return the `undefined` temporarily.
              //      In this case, the wallet will be considered as `NotExist`
              resolve(undefined);
            });
        });
      } else {
        localStorage?.removeItem(KeyConnectingWalletType);
        localStorage?.setItem(KeyAutoConnectingWalletType, 'wallet-connect');
        this.autoConnectingWalletType = 'wallet-connect';

        return Promise.resolve(
          new KeplrWalletConnectV1(this.walletConnector, {
            onBeforeSendRequest: this.onBeforeSendRequest,
          }),
        );
      }
    } else {
      localStorage?.removeItem(KeyConnectingWalletType);
      localStorage?.setItem(KeyAutoConnectingWalletType, 'extension');
      this.autoConnectingWalletType = 'extension';

      return getKeplrFromWindow();
    }
  };
}

class WalletConnectQRCodeModalV1Renderer {
	constructor() {}

	open(uri: string, cb: any) {
		const wrapper = document.createElement('div');
		wrapper.setAttribute('id', 'wallet-connect-qrcode-modal-v1');
		document.body.appendChild(wrapper);

        window.location.href = `keplrwallet://wcV1?${uri}`;

        console.log(
            {
                uri, cb
            }
        )

		// ReactDOM.render(
		// 	<WalletConnectQRCodeModal
		// 		uri={uri}
		// 		close={() => {
		// 			this.close();
		// 			cb();
		// 		}}
		// 	/>,
		// 	wrapper
		// );
	}

	close() {
		const wrapper = document.getElementById('wallet-connect-qrcode-modal-v1');
		if (wrapper) {
			document.body.removeChild(wrapper);
		}
	}
}

export type WalletType = 'true' | 'extension' | 'wallet-connect' | null;
export const KeyConnectingWalletType = 'connecting_wallet_type';
export const KeyAutoConnectingWalletType = 'account_auto_connect';
