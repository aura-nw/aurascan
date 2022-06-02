export interface IContractsResponse {
  tx_hash: string;
  height: number;
  type: string;
  timestamp: Date;
  code: number;
  fee: string;
  blockId: number;
  messages: {
    msg: {
      [key: string]: any
    };
    '@type': string;
    funds: {
      denom: string;
      amount: string;
    }[];
    sender: string;
    contract: string;
  }[];
}


export interface ITableContract {
  contractsAddress: string;
  count: number;
  viewAll?: boolean;
  popover?: boolean;
}