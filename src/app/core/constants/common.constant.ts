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
  DATE_ONLY: 'yyyy-MM-dd',
  TIME_ONLY: 'HH:mm:ss',
};

export const PAGE_EVENT = {
  LENGTH: 0,
  PAGE_SIZE: 5,
  PAGE_INDEX: 0,
  PREVIOUS_PAGE_INDEX: 0,
  LENGTH_DEFAULT: 500,
};

export const DATE_TIME_WITH_MILLISECOND = 24 * 60 * 60;

export const VALIDATOR_AVATAR_DF = 'https://validator-logos.s3.ap-southeast-1.amazonaws.com/validator-default.svg';

export const TIME_OUT_CALL_API = 5000;

export const NUM_BLOCK = 10000;

export const CHART_RANGE = {
  H_24: '24h',
  D_7: '7d',
  D_30: '30d',
  MONTH_12: '12M',
};

// Default is Aura address, config on EnvironmentService for other chain
export const LENGTH_CHARACTER = {
  ADDRESS: 43,
  EVM_ADDRESS: 42,
  CONTRACT: 63,
  TRANSACTION: 64,
  IBC: 64,
  EVM_TRANSACTION: 66,
};

export const NULL_ADDRESS = 'Null address';
export const TIMEOUT_ERROR = 'TimeoutError';

export const TOKEN_ID_GET_PRICE = {
  AURA: 'aura-network',
  BTC: 'bitcoin',
};

export const COIN_TOKEN_TYPE = {
  NATIVE: 'native',
  IBC: 'ibc',
  CW20: 'cw20',
  ERC20: 'erc20',
};

export enum MEDIA_TYPE {
  IMG = 'img',
  VIDEO = 'video',
  _3D = '3d',
  AUDIO = 'audio',
}

export const CW20_TRACKING = ['mint', 'burn', 'transfer', 'send', 'transfer_from', 'burn_from', 'send_from'];
export const CW721_TRACKING = ['mint', 'burn', 'transfer_nft', 'send_nft'];
export const ERC721_TRACKING = ['transfer'];

export const MAX_NUMBER_INPUT = 100000000000000;
export const NUMBER_ONLY_DECIMAL = '1.0-0';
export const NUMBER_2_DIGIT = '1.2-2';
export const NUMBER_6_DIGIT = '1.2-6';
export const TOTAL_GROUP_TRACKING = 7;
export const STORAGE_KEYS = {
  USER_EMAIL: 'userEmail',
  LIST_VALIDATOR: 'listValidator',
  LIST_NAME_TAG: 'listNameTag',
  USER_DATA: 'userData',
  LIST_WATCH_LIST: 'listWatchList',
  REGISTER_FCM: 'registerFCM',
  LIST_TOKEN_IBC: 'listTokenIBC',
  LIST_INFO_CHAIN: 'listInfoChain',
  LOGIN_PROVIDER: 'provider',
  SET_ADDRESS_NAME_TAG: 'setAddressNameTag',
  SET_ADDRESS_WATCH_LIST: 'setAddressWatchList',
  SHOW_POPUP_IBC: 'showPopupIBC',
  IBC_DETAIL: 'ibcDetail',
  SET_DATA_EXPORT: 'setDataExport',
  CONTRACT_RAW_DATA: 'contractRawData',
  IS_VERIFY_TAB: 'isVerifyTab',
  TAB_UNEQUIP: 'tabUnEquip',
  LAST_USED_PROVIDER: 'LAST_USED_PROVIDER',
  DATA_NATIVE: 'nativeData',
};

export const TITLE_LOGO = 'assets/images/logo/title-logo.png';
export const MAX_LENGTH_NAME_TAG = 35;

export enum EFileType {
  Json = 'application/json',
  Zip = 'application/x-zip-compressed',
}

export enum EMethodContract {
  Creation = '60806040',
}
