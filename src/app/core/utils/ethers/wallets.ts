export interface IEvmWallet {
  name: string;
  prettyName: string;
  logo: string;
  downloadInfo?: string;
  state?: 'Pending' | 'Done';
}

export const EVM_WALLETS = [
  {
    name: 'Metamask',
    prettyName: 'Metamask',
    logo: 'assets/images/icons/metamask.svg',
    downloadInfo: 'https://metamask.io/',
  },
];
