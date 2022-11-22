import { MenuItem } from './menu.model';

export enum MenuName {
  Dashboard = 'Dashboard',
  Transaction = 'Transaction',
  Proposal = 'Proposal',
  Validator = 'Validator',
  Block = 'Block',
  Token = 'Token',
  TokenCW20 = 'TokenCW20',
  TokenCW721 = 'TokenCW721',
  Statistic = 'Statistic',
  TopStatistics = 'Top Statistics',
  Contract = 'Contract',
  Account = 'Account',
  BlockChain = 'Block chain',
  Resources = 'Resources',
  More = 'More',
}

export const MENU: MenuItem[] = [
  {
    id: 1,
    label: 'MENUITEMS.DASHBOARDS',
    icon: 'squares-four',
    link: '/dashboard',
    name: MenuName.Dashboard
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
        link: '/transaction',
        name: MenuName.Transaction
      },
      {
        id: 2,
        label: 'MENUITEMS.VALIDATORS',
        icon: 'graph',
        link: '/validators',
        name: MenuName.Validator
      },
      {
        id: 3,
        label: 'MENUITEMS.PROPOSAL',
        icon: 'envelope-open',
        link: '/votings',
        name: MenuName.Proposal
      },
      {
        id: 4,
        label: 'MENUITEMS.BLOCKS',
        icon: 'stack',
        link: '/blocks',
        name: MenuName.Block
      },
    ]
  },
  {
    id: 3,
    label: 'MENUITEMS.TOKEN',
    icon: 'coins',
    name: MenuName.Token,
    subItems: [
      {
          id: 1,
          label: 'CW-20 Top Tokens',
          link: '/tokens',
          name: MenuName.TokenCW20,
          icon: 'coins',
      },
      {
        id: 2,
        label: 'CW-721 Top Tokens',
        link: '/tokens/tokens-nft',
        name: MenuName.TokenCW721,
        icon: 'coins',
      }
    ]
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
        name: MenuName.Contract
      },
      // {
      //   id: 2,
      //   label: 'MENUITEMS.CHART-STATS',
      //   link: '/statistics/charts-stats',
      //   name: MenuName.ChartStats,
      //   icon: 'line-segments',
      // },
      // {
      //   id: 3,
      //   label: 'MENUITEMS.TOP-STATISTICS',
      //   link: '/statistics/top-statistic',
      //   name: MenuName.TopStatistics,
      //   icon: 'chart-line',
      // }
    ]
  },
  {
    id: 5,
    label: 'MENUITEMS.MORE',
    icon: 'list',
    name: MenuName.More,
    subItems: [
    {
      id: 1,
      label: 'Soulbound Token',
      link: '/soulbound',
      icon: 'users-three',
    }
    // {
    //   id: 2,
    //   label: 'Multi-send',
    //   link: '/fee',
    //   icon: 'users-three',
    // },
    // {
    //   id: 3,
    //   label: 'Fee Grant',
    //   link: '/fee',
    //   icon: 'gas-pump',
    // }
    ]
  },
];
