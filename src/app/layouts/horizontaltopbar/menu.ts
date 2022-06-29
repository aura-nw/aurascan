import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
  {
    id: 1,
    label: 'MENUITEMS.DASHBOARDS.TEXT',
    icon: 'grid',
    link: '/dashboard',
  },
  {
    id: 2,
    label: 'MENUITEMS.TRANSACTION.TEXT',
    icon: 'credit-card',
    link: '/transaction',
  },
  {
    id: 3,
    label: 'MENUITEMS.VALIDATORS.TEXT',
    icon: 'collab',
    link: '/validators',
  },
  {
    id: 4,
    label: 'MENUITEMS.PROPOSAL.TEXT',
    icon: 'archive',
    link: '/proposal',
  },
  {
    id: 5,
    label: 'MENUITEMS.BLOCKS.TEXT',
    icon: 'block',
    link: '/blocks',
  },
  {
      id: 6,
      label: 'MENUITEMS.TOKEN.TEXT',
      icon: 'user',
      link: '/token',
      subItems: [
          {
              id: 1,
              label: 'CW-20 Top Tokens',
              link: '/token',
          },
          {
              id: 2,
              label: 'CW-721 Top Tokens',
              link: '/token/tokens-nft',
          }
      ]
  },
  {
    id: 6,
    label: 'MENUITEMS.CONTRACT.TEXT',
    icon: 'file-document',
    link: '/contracts',
  },
  {
    id: 7,
    label: 'MENUITEMS.ACCOUNT.TEXT',
    icon: 'user',
    link: '',
  },
  // {
  //     id: 6,
  //     label: 'MENUITEMS.CHANEL.TEXT',
  //     icon: 'refresh-cw',
  //     link: '/chanels',
  // },
  // {
  //     id: 7,
  //     label: 'MENUITEMS.USER_MANAGEMENT.TEXT',
  //     icon: 'users',
  //     link: '/user-management',
  // },
];
