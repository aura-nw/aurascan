import { Wallet } from '@cosmos-kit/core';
import { ICON } from '../constant';

export const walletConnectInfo: Wallet = {
  name: 'wc',
  prettyName: 'Wallet Connect',
  logo: ICON,
  mode: 'wallet-connect',
  mobileDisabled: true,
  rejectMessage: {
    source: 'Request rejected',
  },
  downloads: [],
  connectEventNamesOnWindow: [''],
  walletconnect: {
    name: 'wc',
    projectId: 'f371e1f6882d401122d20c719baf663a',
    encoding: 'base64',
  },
};
