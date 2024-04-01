import { EFeature } from 'src/app/core/models/common.model';
import { MenuItem } from './menu.model';

export enum MenuName {
  Dashboard = 'Dashboard',
  Transaction = 'Cosmos Transactions',
  EvmTransaction = 'EVM Transactions',
  Proposal = 'Proposal',
  Validator = 'Validator',
  Block = 'Block',
  Token = 'Token',
  TokenCW20 = 'Coins & Tokens',
  TokenCW721 = 'NFTs',
  TokenCW4973 = 'ABTs',
  Statistic = 'Statistic',
  ChartStats = 'Chart & Stats',
  TopStatistics = 'Top Statistics',
  Contract = 'Cosmos Contracts',
  EvmContract = 'EVM Contracts',
  Account = 'Account',
  BlockChain = 'Block chain',
  Resources = 'Resources',
  CodeList = 'Cosmos Code ID',
  IBC = 'IBC Relayers',
  More = 'More',
}

export const MENU: MenuItem[] = [
  {
    id: 1,
    label: 'MENUITEMS.DASHBOARDS',
    icon: 'squares-four',
    link: '/',
    name: MenuName.Dashboard,
  },
  {
    id: 2,
    label: 'MENUITEMS.BLOCKCHAIN',
    icon: 'stack',
    name: MenuName.BlockChain,
    subItems: [
      {
        id: 1,
        label: 'MENUITEMS.TRANSACTION',
        icon: 'credit-card',
        link: '/transactions',
        activeLink: 'transaction',
        name: MenuName.Transaction,
      },
      {
        id: 2,
        label: 'MENUITEMS.EVM_TRANSACTION',
        icon: 'file-text',
        link: '/evm-transactions',
        activeLink: 'evm-transaction',
        name: MenuName.EvmTransaction,
      },
      {
        id: 3,
        label: 'MENUITEMS.VALIDATORS',
        icon: 'graph',
        link: '/validators',
        name: MenuName.Validator,
      },
      {
        id: 4,
        label: 'MENUITEMS.PROPOSAL',
        icon: 'envelope-open',
        link: '/votings',
        activeLink: 'voting',
        name: MenuName.Proposal,
      },
      {
        id: 5,
        label: 'MENUITEMS.BLOCKS',
        icon: 'stack',
        link: '/blocks',
        name: MenuName.Block,
      },
      {
        id: 6,
        label: 'MENUITEMS.IBC-RELAYER',
        icon: 'ph ph-intersect',
        link: '/ibc-relayer',
        name: MenuName.IBC,
        featureName: EFeature.IbcRelayer,
      },
    ],
  },
  {
    id: 3,
    label: 'MENUITEMS.TOKEN',
    icon: 'coins',
    name: MenuName.Token,
    subItems: [
      {
        id: 1,
        label: 'Fungible Tokens',
        link: '/tokens',
        activeLink: 'token',
        name: MenuName.TokenCW20,
        icon: 'coins',
        featureName: EFeature.Cw20,
        activeString: '/token/cw20',
      },
      {
        id: 2,
        label: 'Non-fungible Tokens',
        link: '/tokens/tokens-nft',
        activeLink: 'nft',
        name: MenuName.TokenCW721,
        icon: 'icon icon-nft',
        activeString: '/token/cw721',
        featureName: EFeature.Cw721,
      },
      {
        id: 3,
        label: 'Account Bound Tokens',
        link: '/tokens/token-abt',
        activeLink: 'abt',
        name: MenuName.TokenCW4973,
        icon: 'icon icon-bound-token',
        activeString: '/token/cw4973',
        featureName: EFeature.Cw4973,
      },
    ],
  },
  {
    id: 4,
    label: 'MENUITEMS.RESOURCES',
    icon: 'newspaper',
    name: MenuName.Resources,
    subItems: [
      {
        id: 1,
        label: 'MENUITEMS.CONTRACT',
        icon: 'newspaper',
        link: '/contracts',
        name: MenuName.Contract,
        activeString: '/contracts',
      },
      {
        id: 2,
        label: 'MENUITEMS.EVM_CONTRACT',
        icon: 'newspaper',
        link: '/evm-contracts',
        name: MenuName.EvmContract,
      },
      {
        id: 3,
        label: 'MENUITEMS.CODE-LIST',
        icon: 'code-simple',
        link: '/code-ids',
        activeString: 'code-ids/detail',
        name: MenuName.CodeList,
      },
    ],
  },
  {
    id: 6,
    label: 'MENUITEMS.STATISTICS',
    icon: 'chart-line',
    link: '/',
    name: MenuName.Statistic,
    subItems: [
      {
        id: 1,
        label: 'MENUITEMS.CHART-STATS',
        link: '/statistics/charts-stats',
        name: MenuName.ChartStats,
        icon: 'line-segments',
        featureName: EFeature.Statistics,
        activeString: 'statistics/chart',
      },
      {
        id: 2,
        label: 'MENUITEMS.TOP-STATISTICS',
        link: '/statistics/top-statistic',
        name: MenuName.TopStatistics,
        icon: 'chart-line-up',
        featureName: EFeature.TopStatistics,
      },
    ],
  },
  {
    id: 5,
    label: 'MENUITEMS.MORE',
    icon: 'list',
    name: MenuName.More,
    subItems: [
      {
        id: 1,
        label: 'Fee Grant',
        link: '/fee-grant',
        icon: 'gas-pump',
        featureName: EFeature.FeeGrant,
      },
      {
        id: 2,
        label: 'ABT Creator',
        link: '/accountbound',
        icon: 'medal',
        featureName: EFeature.Cw4973,
      },
      {
        id: 3,
        label: 'Export Data (.CSV)',
        link: '/export-csv',
        icon: 'export',
        featureName: EFeature.ExportCsv,
      },
    ],
  },
];

export const MENU_MOB: MenuItem[] = [
  {
    id: 1,
    label: 'MENUITEMS.DASHBOARDS',
    icon: 'squares-four',
    link: '/',
    name: MenuName.Dashboard,
  },
  {
    id: 2,
    label: 'MENUITEMS.BLOCKCHAIN',
    icon: 'stack',
    name: MenuName.BlockChain,
    subItems: [
      {
        id: 1,
        label: 'MENUITEMS.TRANSACTION',
        icon: 'credit-card',
        link: '/transactions',
        activeLink: 'transaction',
        name: MenuName.Transaction,
      },
      {
        id: 2,
        label: 'MENUITEMS.EVM_TRANSACTION',
        icon: 'file-text',
        link: '/evm-transactions',
        activeLink: 'evm-transaction',
        name: MenuName.EvmTransaction,
      },
      {
        id: 3,
        label: 'MENUITEMS.VALIDATORS',
        icon: 'graph',
        link: '/validators',
        name: MenuName.Validator,
      },
      {
        id: 4,
        label: 'MENUITEMS.PROPOSAL',
        icon: 'envelope-open',
        link: '/votings',
        activeLink: 'voting',
        name: MenuName.Proposal,
      },
      {
        id: 5,
        label: 'MENUITEMS.BLOCKS',
        icon: 'stack',
        link: '/blocks',
        name: MenuName.Block,
      },
      {
        id: 6,
        label: 'MENUITEMS.IBC-RELAYER',
        icon: 'ph ph-intersect',
        link: '/ibc-relayer',
        name: MenuName.IBC,
        featureName: EFeature.IbcRelayer,
      },
    ],
  },
  {
    id: 3,
    label: 'MENUITEMS.TOKEN',
    icon: 'coins',
    name: MenuName.Token,
    subItems: [
      {
        id: 1,
        label: 'Fungible Tokens',
        link: '/tokens',
        activeLink: 'token',
        name: MenuName.TokenCW20,
        icon: 'coins',
        featureName: EFeature.Cw20,
      },
      {
        id: 2,
        label: 'Non-fungible Tokens',
        link: '/tokens/tokens-nft',
        activeLink: 'nft',
        name: MenuName.TokenCW721,
        icon: 'icon icon-nft',
        featureName: EFeature.Cw721,
      },
      {
        id: 3,
        label: 'Account Bound Tokens',
        link: '/tokens/token-abt',
        activeLink: 'abt',
        name: MenuName.TokenCW4973,
        icon: 'icon icon-bound-token',
        featureName: EFeature.Cw4973,
      },
    ],
  },
  {
    id: 4,
    label: 'MENUITEMS.RESOURCES',
    icon: 'newspaper',
    name: MenuName.Resources,
    subItems: [
      {
        id: 1,
        label: 'MENUITEMS.CONTRACT',
        icon: 'newspaper',
        link: '/contracts',
        name: MenuName.Contract,
      },
      {
        id: 2,
        label: 'MENUITEMS.EVM_CONTRACT',
        icon: 'newspaper',
        link: '/evm-contracts',
        name: MenuName.EvmContract,
      },
      {
        id: 3,
        label: 'MENUITEMS.CODE-LIST',
        icon: 'code-simple',
        link: '/code-ids',
        name: MenuName.CodeList,
      },
      {
        id: 4,
        label: 'MENUITEMS.CHART-STATS',
        link: '/statistics/charts-stats',
        name: MenuName.ChartStats,
        icon: 'line-segments',
        featureName: EFeature.Statistics,
      },
      {
        id: 5,
        label: 'MENUITEMS.TOP-STATISTICS',
        link: '/statistics/top-statistic',
        name: MenuName.TopStatistics,
        icon: 'chart-line-up',
        featureName: EFeature.TopStatistics,
      },
    ],
  },
  {
    id: 5,
    label: 'MENUITEMS.MORE',
    icon: 'list',
    name: MenuName.More,
    subItems: [
      {
        id: 1,
        label: 'Fee Grant',
        link: '/fee-grant',
        icon: 'gas-pump',
        featureName: EFeature.FeeGrant,
      },
      {
        id: 2,
        label: 'ABT Creator',
        link: '/accountbound',
        icon: 'medal',
        featureName: EFeature.Cw4973,
      },
      {
        id: 3,
        label: 'Export Data (.CSV)',
        link: '/export-csv',
        icon: 'export',
        featureName: EFeature.ExportCsv,
      },
    ],
  },
];
