export const NAVBARITEM = [
    {
        link: '/primary-market',
        label: 'Thị trường sơ cấp'
    },
    {
        link: '/2',
        label: 'Thị trường thứ cấp'
    },
    {
        link: '/exchange',
        label: 'Giao Dịch'
    },
    {
        link: '/account',
        label: 'Tài khoản'
    }
];

export const MY_FORMATS = {
    parse: {
        dateInput: 'LL',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'YYYY',
    },
};

export const NETWORK = [
    {
        value: 1,
        label: 'Fabric',
        icon: '/assets/images/icons/fabric.png'
    },
    {
        value: 2,
        label: 'Cosmos',
        icon: '/assets/images/icons/chain_cosmos.svg'
    }
];

export const DATEFORMAT = {
  DATETIME_UTC: 'yyyy-MM-dd HH:mm:ss'
};

export const NUMBER_CONVERT = 1000000; //10^6 satoshi unit