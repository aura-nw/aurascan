import { TableTemplate } from 'src/app/core/models/common.model';
import { ContractRegisterType, ContractTab } from './contract.enum';

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

export const CONTRACT_RESULT = {
  TBD: 'TBD',
  CORRECT: 'Correct',
  INCORRECT: 'Incorrect',
};

export const MAX_LENGTH_SEARCH_CONTRACT = 200;

export const CONTRACT_TABLE_TEMPLATES: Array<TableTemplate> = [
  // { matColumnDef: 'popover', headerCellDef: '', type: 'popover', headerWidth: 4 },
  { matColumnDef: 'txHash', headerCellDef: 'Txn Hash', type: 'hash-url', headerWidth: 12, isUrl: '/transaction' },
  { matColumnDef: 'method', headerCellDef: 'Method', type: 'status', headerWidth: 12 },
  { matColumnDef: 'status', headerCellDef: 'Result', type: 'result', headerWidth: 9 },
  { matColumnDef: 'blockHeight', headerCellDef: 'Block', type: 'hash-url', headerWidth: 6, isUrl: '/blocks' },
  { matColumnDef: 'time', headerCellDef: 'Time', type: 'time-distance', headerWidth: 8, suffix: 'ago' },
  { matColumnDef: 'from', headerCellDef: 'From', type: 'hash-url', headerWidth: 12, isUrl: '/account' },
  { matColumnDef: 'label', headerCellDef: '', type: 'status', headerWidth: 6, justify: 'center' },
  { matColumnDef: 'to', headerCellDef: 'To', type: 'hash-url', headerWidth: 12, isUrl: '/contracts' },
  { matColumnDef: 'fee', headerCellDef: 'Txn Fee', type: 'numb', headerWidth: 10 },
];

export const CONTRACT_VERSIONS = [
  { label: 'cosmwasm/rust-optimizer:0.10.9', value: 'cosmwasm/rust-optimizer:0.10.9' },
  { label: 'cosmwasm/rust-optimizer:0.11.0', value: 'cosmwasm/rust-optimizer:0.11.0' },
  { label: 'cosmwasm/rust-optimizer:0.11.2', value: 'cosmwasm/rust-optimizer:0.11.2' },
  { label: 'cosmwasm/rust-optimizer:0.11.3', value: 'cosmwasm/rust-optimizer:0.11.3' },
  { label: 'cosmwasm/rust-optimizer:0.11.4', value: 'cosmwasm/rust-optimizer:0.11.4' },
  { label: 'cosmwasm/rust-optimizer:0.11.5', value: 'cosmwasm/rust-optimizer:0.11.5' },
  { label: 'cosmwasm/rust-optimizer:0.12.0', value: 'cosmwasm/rust-optimizer:0.12.0' },
  { label: 'cosmwasm/rust-optimizer:0.12.1', value: 'cosmwasm/rust-optimizer:0.12.1' },
  { label: 'cosmwasm/rust-optimizer:0.12.3', value: 'cosmwasm/rust-optimizer:0.12.3' },
  { label: 'cosmwasm/rust-optimizer:0.12.4', value: 'cosmwasm/rust-optimizer:0.12.4' },
  { label: 'cosmwasm/rust-optimizer:0.12.5', value: 'cosmwasm/rust-optimizer:0.12.5' },
  { label: 'cosmwasm/rust-optimizer:0.12.6', value: 'cosmwasm/rust-optimizer:0.12.6' },
  { label: 'cosmwasm/rust-optimizer:0.12.7', value: 'cosmwasm/rust-optimizer:0.12.7' },
  { label: 'cosmwasm/rust-optimizer:0.12.8', value: 'cosmwasm/rust-optimizer:0.12.8' },
  { label: 'cosmwasm/rust-optimizer:0.12.9', value: 'cosmwasm/rust-optimizer:0.12.9' },
  { label: 'cosmwasm/rust-optimizer:0.12.10', value: 'cosmwasm/rust-optimizer:0.12.10' },
  { label: 'cosmwasm/rust-optimizer:0.12.11', value: 'cosmwasm/rust-optimizer:0.12.11' },
  { label: 'cosmwasm/rust-optimizer:0.12.12', value: 'cosmwasm/rust-optimizer:0.12.12' },
  { label: 'cosmwasm/rust-optimizer:0.12.13', value: 'cosmwasm/rust-optimizer:0.12.13' },

  // { label: 'cosmwasm/rust-optimizer-arm64:0.12.4', value: 'cosmwasm/rust-optimizer-arm64:0.12.4' },
  // { label: 'cosmwasm/rust-optimizer-arm64:0.12.5', value: 'cosmwasm/rust-optimizer-arm64:0.12.5' },
  // { label: 'cosmwasm/rust-optimizer-arm64:0.12.6', value: 'cosmwasm/rust-optimizer-arm64:0.12.6' },

  { label: 'cosmwasm/workspace-optimizer:0.10.8', value: 'cosmwasm/workspace-optimizer:0.10.8' },
  { label: 'cosmwasm/workspace-optimizer:0.10.9', value: 'cosmwasm/workspace-optimizer:0.10.9' },
  { label: 'cosmwasm/workspace-optimizer:0.11.0', value: 'cosmwasm/workspace-optimizer:0.11.0' },
  { label: 'cosmwasm/workspace-optimizer:0.11.2', value: 'cosmwasm/workspace-optimizer:0.11.2' },
  { label: 'cosmwasm/workspace-optimizer:0.11.3', value: 'cosmwasm/workspace-optimizer:0.11.3' },
  { label: 'cosmwasm/workspace-optimizer:0.11.4', value: 'cosmwasm/workspace-optimizer:0.11.4' },
  { label: 'cosmwasm/workspace-optimizer:0.11.5', value: 'cosmwasm/workspace-optimizer:0.11.5' },
  { label: 'cosmwasm/workspace-optimizer:0.12.0', value: 'cosmwasm/workspace-optimizer:0.12.0' },
  { label: 'cosmwasm/workspace-optimizer:0.12.1', value: 'cosmwasm/workspace-optimizer:0.12.1' },
  { label: 'cosmwasm/workspace-optimizer:0.12.3', value: 'cosmwasm/workspace-optimizer:0.12.3' },
  { label: 'cosmwasm/workspace-optimizer:0.12.4', value: 'cosmwasm/workspace-optimizer:0.12.4' },
  { label: 'cosmwasm/workspace-optimizer:0.12.5', value: 'cosmwasm/workspace-optimizer:0.12.5' },
  { label: 'cosmwasm/workspace-optimizer:0.12.6', value: 'cosmwasm/workspace-optimizer:0.12.6' },
  { label: 'cosmwasm/workspace-optimizer:0.12.7', value: 'cosmwasm/workspace-optimizer:0.12.7' },
  { label: 'cosmwasm/workspace-optimizer:0.12.8', value: 'cosmwasm/workspace-optimizer:0.12.8' },
  { label: 'cosmwasm/workspace-optimizer:0.12.9', value: 'cosmwasm/workspace-optimizer:0.12.9' },
  { label: 'cosmwasm/workspace-optimizer:0.12.10', value: 'cosmwasm/workspace-optimizer:0.12.10' },
  { label: 'cosmwasm/workspace-optimizer:0.12.11', value: 'cosmwasm/workspace-optimizer:0.12.11' },
  { label: 'cosmwasm/workspace-optimizer:0.12.12', value: 'cosmwasm/workspace-optimizer:0.12.12' },
  { label: 'cosmwasm/workspace-optimizer:0.12.13', value: 'cosmwasm/workspace-optimizer:0.12.13' },

  // { label: 'cosmwasm/workspace-optimizer-arm64:0.12.4', value: 'cosmwasm/workspace-optimizer-arm64:0.12.4' },
  // { label: 'cosmwasm/workspace-optimizer-arm64:0.12.5', value: 'cosmwasm/workspace-optimizer-arm64:0.12.5' },
  // { label: 'cosmwasm/workspace-optimizer-arm64:0.12.6', value: 'cosmwasm/workspace-optimizer-arm64:0.12.6' },
];

export const REGISTER_CONTRACT = [
  {
    key: ContractRegisterType.CW20,
    value: ContractRegisterType.CW20,
  },
  {
    key: ContractRegisterType.CW721,
    value: ContractRegisterType.CW721,
  },
  {
    key: ContractRegisterType.CW4973,
    value: ContractRegisterType.CW4973,
  },
];

export const LIST_ZEROES = [
  {
    value: '6',
  },
  {
    value: '8',
  },
  {
    value: '18',
  },
  {
    value: 'custom',
  },
];

export const TYPE_CW4973 = 'crates.io:cw4973';
