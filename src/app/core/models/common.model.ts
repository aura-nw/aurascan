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
    Message?: string;
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
  desktopOnly?: boolean = false;
  isUrl?: string;
  isShort?: boolean;
  cssClass?: string;
  paramField?: string;
  type?: string;
  suffix?: string;
  prefix?: string;
  headerWidth?: number;
  isNameTag?: boolean;
  justify?: 'center' | 'flex-start' | 'flex-end'
}

export class ResponseDto {
  status: any;
  data: any;
  meta: any;
}

export class CommonDataDto {
  total_blocks?: number;
  block_time: string;
  bonded_tokens: number;
  community_pool: number;
  inflation: string;
  total_transactions: number;
  total_validator_active_num: number;
  total_validator_num: number;
  bonded_tokens_format: number;
  community_pool_format: number;
  total_aura: number;
}

export interface DataDelegateDto {
  delegatedToken?: string;
  availableToken?: string;
  delegableVesting?: string;
  stakingToken?: string;
  historyTotalReward?: number;
  stakingCurrentValidate?: string;
  dialogMode?: string;
  validatorDetail?: any;
  identity?: string;
}

export enum RangeType {
  month = 'mo',
  day = 'd',
  hour = 'h',
  minute = 'm',
}

export type UserStorage = {
  email: string;
  refreshToken: string;
  accessToken: string;
};