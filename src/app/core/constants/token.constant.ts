import { TokenTab } from './token.enum';

export const TOKEN_TAB = [
  {
    key: TokenTab.Transfers,
    value: 'Transfers',
  },
  {
    key: TokenTab.Holders,
    value: 'Holders',
  },
  {
    key: TokenTab.Inventory,
    value: 'Inventory',
  },
  {
    key: TokenTab.Info,
    value: 'Info',
  },
  {
    key: TokenTab.Contract,
    value: 'Contract',
  },
  {
    key: TokenTab.Analytics,
    value: 'Analytics',
  },
];

export const MAX_LENGTH_SEARCH_TOKEN = 100;

export enum ETokenCoinType {
  NATIVE = 'Native',
  IBC = 'IBC Token',
  CW20 = 'CW20 Token',
  ERC20 = 'ERC20 Token',
}

export enum ETokenCoinTypeBE {
  NATIVE = 'NATIVE',
  IBC = 'IBC_TOKEN',
  CW20 = 'CW20_TOKEN',
  ERC20 = 'ERC20_TOKEN',
}

export enum ETokenNFTTypeBE {
  CW721 = 'CW721_TOKEN',
  ERC721 = 'ERC721_TOKEN',
}

export const TOKEN_EVM_BURNT = '0x0000000000000000000000000000000000000000';

export const SOCIAL_MEDIA = {
  youtube: {
    name: 'youtube',
    icon: 'assets/icons/icons-svg/basic/youtube.svg',
  },
  twitter: {
    name: 'twitter',
    icon: 'assets/icons/icons-svg/basic/twitter.svg',
  },
  discord: {
    name: 'discord',
    icon: 'assets/icons/icons-svg/basic/discord.svg',
  },
  telegram: {
    name: 'telegram',
    icon: 'assets/icons/icons-svg/basic/telegram.svg',
  },
  linkedin: {
    name: 'linkedin',
    icon: 'assets/icons/icons-svg/basic/linkedIn.svg',
  },
  github: {
    name: 'github',
    icon: 'assets/icons/icons-svg/basic/github.svg',
  },
  facebook: {
    name: 'facebook',
    icon: 'assets/icons/icons-svg/basic/fb-circle.svg',
  },
  medium: {
    name: 'medium',
    icon: 'assets/icons/icons-svg/basic/medium.svg',
  },
  otherWebsite: {
    name: 'otherWebsite',
    icon: 'assets/icons/icons-svg/basic/global.svg',
  },
};