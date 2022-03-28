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

export const PAGE_EVENT = {
    LENGTH: 0,
    PAGE_SIZE: 5,
    PAGE_INDEX: 0,
    PREVIOUS_PAGE_INDEX: 0,
    LENGTH_DEFAULT: 500
};

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];