export class ResponseTemplate<T> {
  ErrorCode: string;
  Message: string;
  Data: T;
  AdditionalData: any;
}

export interface IResponsesSuccess<T> {
  data: T;
  meta: any;
}
export interface IResponsesError {
  error: {
    statusCode: number;
    message: string;
    errorName: string;
    path: string;
    requestId: string;
    timestamp: Date;
  };
}

export interface IResponsesTemplates<T>
  extends IResponsesSuccess<T>,
    IResponsesError {}

export class TableTemplate {
  matColumnDef: string;
  headerCellDef: string;
  isUrl?: string;
  isShort?: boolean;
  cssClass?: string;
  paramField?: string;
}

export class ATBalanceDto {
  initialAssetTokenPrice: string;
  assetTokenTicker: string;
  assetId: string;
  actualAmountMatched: string;
  avgStableToken: string;
  totalStableToken: string;
  tokenId: string;
  remain: string;
  currentSell: string;
  percent: string;
}

export class InvestmentBookDto {
  status: string;
  createdAt: string;
  assetTokenTicker: string;
  StableTokenBalance: string;
  initialAssetTokenPrice: string;
  amountMatched: string;
  spendingStableToken: string;
}

export class IWSItemIao {
  mainWallet: string;
  remainingAT: string;
  type: string;
}

export type TypeSecondary = "BUY_AT" | "SELL_AT" | "";

export class SecondaryOrderBookDto {
  status: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  expireDate: string;
  saoPrice: string;
  quantity: string;
  remain: string;
  matchQuantity: string;
  totalSAO: string;
  tokenTicker: string;
}

export class SecondaryOrderBookQuery {
  type?: string;
  status?: string;
  startDate?: string;
  expireDate?: string;
  assetTokenTicker?: string;
  pageIndex: number;
  pageSize: number;
}

export class SecondaryHistoryDto {
  status?: string;
  type?: TypeSecondary;
  createdAt?: string;
  updatedAt?: string;
  startDate?: string;
  expireDate?: string;
  saoPrice?: number;
  quantity?: number;
  tokenTicker?: string;
  price?: number;
}

export class SecondaryHistoryQueryDto {
  type?: TypeSecondary;
  status?: string;
  startDate?: string;
  endDate?: string;
  assetTokenTicker?: string;
  pageIndex: number;
  pageSize: number;
}

export class ResponseDto {
  status: any;
  data: any;
  meta: any;
}

export class CommonDataDto {
  block_height?: number;
  block_time: string;
  bonded_tokens: number;
  community_pool: number;
  inflation: string;
  total_txs_num: number;
  total_validator_active_num: number;
  total_validator_num: number;
  bonded_tokens_format: number;
  community_pool_format: number;
}

export class DataDelegateDto {
  delegatedToken: string;
  availableToken: string;
  stakingToken: string;
  stakingCurrentValidate: string;
  dialogMode: string = '';
  validatorDetail: any;
}