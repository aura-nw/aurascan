import { CodeTransaction } from "src/app/core/constants/transaction.enum";
import { ContractVerifyType } from "../constants/contract.enum";

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


export interface IContractPopoverData {
  status: string;
  code: CodeTransaction;
  amount: number;
  price: number;
  tokenAddress: string;
  from_address: string;
  symbol: string;
  to_address: string;
  tx_hash: string;
  fee: number;
}


export const DROPDOWN_ELEMENT = [
  {
    image: 'assets/icons/icons-svg/white/arrow-right-2.svg',
    label: 'View OutGoing Txns',
    key: 0,
  },
  {
    image: 'assets/icons/icons-svg/white/arrow-left-2.svg',
    label: 'View Ingoing Txns',
    key: 1,
  },
  {
    image: 'assets/icons/icons-svg/white/contract.svg',
    label: 'View Contract Creation',
    key: 2,
  },
];

export class ContractDetailDto {
  contractTypeData: string = ContractVerifyType.Unverifed;
}
