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
        label: 'MENUITEMS.NETWORK.TEXT',
        icon: 'layers',
        link: '/network',
    },
    {
        id: 3,
        label: 'MENUITEMS.BLOCKS.TEXT',
        icon: 'box',
        link: '/blocks',
    },
    {
        id: 4,
        label: 'MENUITEMS.TRANSACTION.TEXT',
        icon: 'repeat',
        link: '/transaction',
    },
    {
        id: 5,
        label: 'MENUITEMS.CHAINCODE.TEXT',
        icon: 'link',
        link: '/chaincodes',
    },
    {
        id: 6,
        label: 'MENUITEMS.CHANEL.TEXT',
        icon: 'refresh-cw',
        link: '/chanels',
    },
    // {
    //     id: 7,
    //     label: 'MENUITEMS.USER_MANAGEMENT.TEXT',
    //     icon: 'users',
    //     link: '/user-management',
    // },

];

