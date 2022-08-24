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
  Contract = 'Contract',
  Account = 'Account',
}

export const MENU: MenuItem[] = [
  {
    id: 1,
    label: 'MENUITEMS.DASHBOARDS.TEXT',
    icon: 'grid',
    link: '/dashboard',
    name: MenuName.Dashboard,
  },
  {
    id: 2,
    label: 'MENUITEMS.TRANSACTION.TEXT',
    icon: 'credit-card',
    link: '/transaction',
    name: MenuName.Transaction,
  },
  {
    id: 3,
    label: 'MENUITEMS.VALIDATORS.TEXT',
    icon: 'collab',
    link: '/validators',
    name: MenuName.Validator,
  },
  {
    id: 4,
    label: 'MENUITEMS.PROPOSAL.TEXT',
    icon: 'archive',
    link: '/votings',
    name: MenuName.Proposal,
  },
  {
    id: 5,
    label: 'MENUITEMS.BLOCKS.TEXT',
    icon: 'block',
    link: '/blocks',
    name: MenuName.Block,
  },
  {
    id: 6,
    label: 'MENUITEMS.TOKEN.TEXT',
    icon: 'coin',
    link: '/tokens',
    name: MenuName.Token,
    subItems: [
      {
        id: 1,
        label: 'CW-20 Top Tokens',
        link: '/tokens',
        name: MenuName.TokenCW20,
      },
      {
        id: 2,
        label: 'CW-721 Top Tokens',
        link: '/tokens/tokens-nft',
        name: MenuName.TokenCW721,
      },
    ],
  },
  {
    id: 7,
    label: 'MENUITEMS.CONTRACT.TEXT',
    icon: 'file-document',
    link: '/contracts',
    name: MenuName.Contract,
  },
  {
    id: 8,
    label: 'MENUITEMS.ACCOUNT.TEXT',
    icon: 'user',
    link: '',
    name: MenuName.Account,
  },
];
