import { CodeTransaction } from "src/app/core/constants/transaction.enum";
import { TableData } from "src/app/shared/components/contract-table/contract-table.component";

export interface IContractsResponse {
  codespace: string;
  contract_address: string;
  tx_hash: string;
  height: number;
  type: string;
  data: string;
  timestamp: Date;
  gas_used: string;
  gas_wanted: string;
  id: number;
  info: string;
  created_at: Date;
  updated_at: Date;
  code: number;
  fee: string;
  blockId: number;
  raw_log: string;
  raw_log_data: unknown;
  tx: string;
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
    from_address: string;
    to_address: string;
    amount: {
      denom: string;
      amount: string;
    }[];
  }[];
}


export interface ITableContract {
  contractsAddress: string;
  count: number;
  viewAll?: boolean;
  popover?: boolean;
  tableData?: TableData[]
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
  gas_wanted?: string;
  gas_used?: string;
  nftDetail: any;
}


export const DROPDOWN_ELEMENT = [
  {
    image: 'assets/icons/icons-svg/white/arrow-right-2.svg',
    imageActive: 'assets/icons/icons-svg/color/arrow-right-active.svg',
    label: 'View Outgoing Txns',
    key: '0',
  },
  {
    image: 'assets/icons/icons-svg/white/arrow-left-2.svg',
    imageActive: 'assets/icons/icons-svg/color/arrow-left-active.svg',
    label: 'View Ingoing Txns',
    key: '1',
  },
  {
    image: 'assets/icons/icons-svg/white/contract.svg',
    imageActive: 'assets/icons/icons-svg/color/contract-active.svg',
    label: 'View Contract Creation',
    key: '2',
  },
];
