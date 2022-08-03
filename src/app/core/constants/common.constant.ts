export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
  PRICE_6: '1.6-6',
  PRICE_2: '1.2-2',
};

export const NETWORK = [
  {
    value: 1,
    label: 'Fabric',
    icon: '/assets/images/icons/fabric.png',
  },
  {
    value: 2,
    label: 'Cosmos',
    icon: '/assets/images/icons/chain_cosmos.svg',
  },
];

export const DATEFORMAT = {
  DATETIME_UTC: 'yyyy-MM-dd HH:mm:ss',
  DATE_ONLY: 'dd/MM/yyyy',
};

export const NUMBER_CONVERT = 1000000; //10^6 satoshi unit

export const PAGE_EVENT = {
  LENGTH: 0,
  PAGE_SIZE: 5,
  PAGE_INDEX: 0,
  PREVIOUS_PAGE_INDEX: 0,
  LENGTH_DEFAULT: 500,
};

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const VALIDATOR_ADDRESS_PREFIX = 'auravaloper';

export const ADDRESS_PREFIX = 'aura';

// export const AURA_DENOM = 'utaura';

export const DATE_TIME_WITH_MILLISECOND = 24 * 60 * 60;

export const VALIDATOR_AVATAR_DF = 'https://validator-logos.s3.ap-southeast-1.amazonaws.com/validator-default.svg';
export const VALIDATOR_AVATAR_URL =
  'https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/moniker/chihuahua/';

export const TIME_OUT_CALL_API = 5000;

export const NUM_BLOCK = 10000;

export const INDEXER_URL = "https://indexer.dev.aurascan.io:/api/v1";

export const CHART_RANGE = {
  M_60: '60m',
  H_24: '24h',
  D_30: '30d',
  MONTH_12: '12M',
};
