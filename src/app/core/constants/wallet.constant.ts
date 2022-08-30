export enum WALLET_PROVIDER {
  KEPLR = 'KEPLR',
  COIN98 = 'COIN98',
}

export const LAST_USED_PROVIDER = 'LAST_USED_PROVIDER';

export const ChainsInfo: { [chainId: string]: any } = {
  ['aura-testnet']: {
    chainId: 'aura-testnet',
    chainName: 'aura devnet',
    rpc: 'https://rpc.dev.aura.network',
    rest: 'https://lcd.dev.aura.network',
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'aura',
      bech32PrefixAccPub: 'aura' + 'pub',
      bech32PrefixValAddr: 'aura' + 'valoper',
      bech32PrefixValPub: 'aura' + 'valoperpub',
      bech32PrefixConsAddr: 'aura' + 'valcons',
      bech32PrefixConsPub: 'aura' + 'valconspub',
    },
    currencies: [
      {
        coinDenom: 'TAURA',
        coinMinimalDenom: 'utaura',
        coinDecimals: 6,
        // coinGeckoId: "aura",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'TAURA',
        coinMinimalDenom: 'utaura',
        coinDecimals: 6,
        // coinGeckoId: "uaura",
      },
    ],
    stakeCurrency: {
      coinDenom: 'TAURA',
      coinMinimalDenom: 'utaura',
      coinDecimals: 6,
      // coinGeckoId: "uaura",
    },
    coinType: 118,
    gasPriceStep: {
      low: 0.0001,
      average: 0.00025,
      high: 0.0004,
    },
    features: ['no-legacy-stdTx'],
    walletUrlForStaking: "https://explorer.dev.aura.network/validators",
    logo: "https://i.imgur.com/zi0mTYb.png",
    explorer: "https://explorer.dev.aura.network/"
  },
  ['serenity-testnet-001']: {
    chainId: "serenity-testnet-001",
    chainName: "Aura Serenity TestNet",
    rpc: "https://rpc.serenity.aura.network",
    rest: "https://lcd.serenity.aura.network",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "aura",
      bech32PrefixAccPub: "aura" + "pub",
      bech32PrefixValAddr: "aura" + "valoper",
      bech32PrefixValPub: "aura" + "valoperpub",
      bech32PrefixConsAddr: "aura" + "valcons",
      bech32PrefixConsPub: "aura" + "valconspub",
    },
    currencies: [{
      coinDenom: "AURA",
      coinMinimalDenom: "uaura",
      coinDecimals: 6,
      // coinGeckoId: "aura",
    }, ],
    feeCurrencies: [{
      coinDenom: "AURA",
      coinMinimalDenom: "uaura",
      coinDecimals: 6,
      // coinGeckoId: "uaura",
    }, ],
    stakeCurrency: {
      coinDenom: "AURA",
      coinMinimalDenom: "uaura",
      coinDecimals: 6,
      // coinGeckoId: "uaura",
    },
    coinType: 118,
    gasPriceStep: {
      low: 0.001,
      average: 0.0025,
      high: 0.004
    },
    features: ['no-legacy-stdTx'],
    walletUrlForStaking: "https://serenity.aurascan.io/validators",
    logo: "https://i.imgur.com/zi0mTYb.png",
    explorer: "https://serenity.aurascan.io/"
  },
  ['halo-testnet-001']: {
    chainId: "halo-testnet-001",
    chainName: "Aura Halo TestNet",
    rpc: "https://rpc.halo.aura.network",
    rest: "https://lcd.halo.aura.network",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "aura",
      bech32PrefixAccPub: "aura" + "pub",
      bech32PrefixValAddr: "aura" + "valoper",
      bech32PrefixValPub: "aura" + "valoperpub",
      bech32PrefixConsAddr: "aura" + "valcons",
      bech32PrefixConsPub: "aura" + "valconspub",
    },
    currencies: [{
      coinDenom: "AURA",
      coinMinimalDenom: "uaura",
      coinDecimals: 6,
      // coinGeckoId: "aura",
    }, ],
    feeCurrencies: [{
      coinDenom: "AURA",
      coinMinimalDenom: "uaura",
      coinDecimals: 6,
      // coinGeckoId: "uaura",
    }, ],
    stakeCurrency: {
      coinDenom: "AURA",
      coinMinimalDenom: "uaura",
      coinDecimals: 6,
      // coinGeckoId: "uaura",
    },
    coinType: 118,
    gasPriceStep: {
      low: 0.001,
      average: 0.0025,
      high: 0.004
    },
    features: ['no-legacy-stdTx'],
    walletUrlForStaking: "https://halo.aurascan.io/validators",
    logo: "https://i.imgur.com/zi0mTYb.png",
    explorer: "https://halo.aurascan.io/"
  }
};

export enum KEPLR_ERRORS {
  Success = 'OK',
  Failed = 'FAILED',
  NoChainInfo = 'THERE IS NO CHAIN INFO FOR',
  SameChain = 'SAME CHAIN IS ALREADY REGISTERED',
  NotRegistered = 'CHAIN IS NOT REGISTERED',
  RequestRejected = 'REQUEST REJECTED',
  NotInstall = 'NOT INSTALL',
  NOT_EXIST = "KEY DOESN'T EXIST",
}

export const SIGNING_MESSAGE_TYPES = {
  STAKE: 'Delegate',//`StakeTx`,
  RESTAKE: `Redelegate`,
  UNSTAKE: 'Undelegate',//`UnstakeTx`,
  VOTE: `Vote`,
  DEPOSIT: `DepositTx`,
  CLAIM_REWARDS: `GetReward`,
  WRITE_CONTRACT: `WriteContract`,
  UNKNOWN: `UnknownTx`,
};

export enum ESigningType {
  Keplr = 'Keplr',
  Coin98 = 'Coin98',
}
