import { TableTemplate } from "src/app/core/models/common.model";
import { ContractTab } from "./contract.enum";

export const CONTRACT_TAB = [
  {
    key: ContractTab.Transactions,
    value: 'Transactions',
  },
  {
    key: ContractTab.Cw20Token,
    value: 'CW20 Token Txns',
  },
  {
    key: ContractTab.Contract,
    value: 'Contract',
  },
  {
    key: ContractTab.Events,
    value: 'Events',
  },
  {
    key: ContractTab.Analytics,
    value: 'Analytics',
  },
];

export const MAX_LENGTH_SEARCH_CONTRACT = 200;

export const CONTRACT_TABLE_TEMPLATES: Array<TableTemplate> = [
  { matColumnDef: 'popover', headerCellDef: '', type:'popover' , headerWidth: 4 },
  { matColumnDef: 'txHash', headerCellDef: 'Txn Hash', type: 'hash-url', isUrl: '/transaction' },
  { matColumnDef: 'method', headerCellDef: 'Method', type: 'status', headerWidth: 10 },
  { matColumnDef: 'blockHeight', headerCellDef: 'Block', type: 'hash-url', headerWidth: 8, isUrl: '/blocks/id', paramField: 'blockId'  },
  { matColumnDef: 'time', headerCellDef: 'Time', type: 'time-distance', headerWidth: 10, suffix: 'ago' },
  { matColumnDef: 'from', headerCellDef: 'From', type: 'hash-url', headerWidth: 15, isUrl: '/account' },
  { matColumnDef: 'label', headerCellDef: '', type: 'status', headerWidth: 8, justify: 'center' },
  { matColumnDef: 'to', headerCellDef: 'To', type: 'hash-url', headerWidth: 15, isUrl: '/account' },
  { matColumnDef: 'value', headerCellDef: 'Value', type: 'numb', suffix: 'AURA', headerWidth: 10 },
  { matColumnDef: 'fee', headerCellDef: 'Txn Fee', type: 'numb', headerWidth: 10 },
];
