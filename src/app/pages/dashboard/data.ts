import { ChartType } from './dashboard.model';

const walletOverview: ChartType = {
  chart: {
    width: 227,
    height: 227,
    type: 'pie'
  },
  colors: ["#777aca", "#5156be", "#a8aada"],
  legend: { show: !1 },
  stroke: {
    width: 0
  },
  series: [35, 70, 15],
  labels: ["Ethereum", "Bitcoin", "Litecoin"],
};

const investedOverview: ChartType = {
  chart: {
    height: 270,
    type: 'radialBar',
    offsetY: -10
  },
  plotOptions: {
    radialBar: {
      startAngle: -130,
      endAngle: 130,
      dataLabels: {
        name: {
          show: false
        },
        value: {
          offsetY: 10,
          fontSize: '18px',
          color: undefined,
          formatter: function (val: any) {
            return val + "%";
          }
        }
      }
    }
  },
  colors: ['#5156be'],
  fill: {
    type: "gradient",
    gradient: {
      shade: "dark",
      type: "horizontal",
      gradientToColors: ['#34c38f'],
      shadeIntensity: 0.15,
      inverseColors: !1,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [20, 60],
    },
  },

  stroke: {
    dashArray: 4,
  },
  legend: {
    show: false
  },
  series: [80],
  labels: ['Series A'],
};

const marketOverview: ChartType = {
  chart: {
    height: 400,
    type: 'bar',
    stacked: !0,
    offsetY: -5,
    toolbar: {
      show: !1
    }
  },
  series: [
    {
      name: "Profit",
      data: [
        12.45, 16.2, 8.9, 11.42, 12.6, 18.1, 18.2, 14.16, 11.1, 8.09, 16.34,
        12.88,
      ],
    },
    {
      name: "Loss",
      data: [
        -11.45, -15.42, -7.9, -12.42, -12.6, -18.1, -18.2, -14.16, -11.1,
        -7.09, -15.34, -11.88,
      ],
    },
  ],
  plotOptions: { bar: { columnWidth: "20%" } },
  stroke: {
    curve: 'smooth'
  },
  colors: ["#5156be", "#34c38f"],
  fill: { opacity: 1 },
  dataLabels: { enabled: !1 },
  legend: { show: !1 },
  xaxis: {
    categories: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    labels: { rotate: -90 },
  },
};

/**
 * Wallet Line Chart
 */
 const walletlineChart: ChartType = {
  series: [
    { data: [2, 10, 18, 22, 36, 15, 47, 75, 65, 19, 14, 2, 47, 42, 15] },
  ],
  chart: { type: "line", height: 50, sparkline: { enabled: !0 } },
  colors: ['#5156be'],
  stroke: { curve: "smooth", width: 2 },
  tooltip: {
    fixed: { enabled: !1 },
    x: { show: !1 },
    marker: { show: !1 },
  },
};

/**
 * Trades Line Chart
 */
 const tradeslineChart: ChartType = {
  series: [
    { data: [15, 42, 47, 2, 14, 19, 65, 75, 47, 15, 42, 47, 2, 14, 12] },
  ],
  chart: { type: "line", height: 50, sparkline: { enabled: !0 } },
  colors: ['#5156be'],
  stroke: { curve: "smooth", width: 2 },
  tooltip: {
    fixed: { enabled: !1 },
    x: { show: !1 },
    marker: { show: !1 },
  },
};

/**
 * Invested Line Chart
 */
 const investedlineChart: ChartType = {
  series: [
    { data: [47, 15, 2, 67, 22, 20, 36, 60, 60, 30, 50, 11, 12, 3, 8] },
  ],
  chart: { type: "line", height: 50, sparkline: { enabled: !0 } },
  colors: ['#5156be'],
  stroke: { curve: "smooth", width: 2 },
  tooltip: {
    fixed: { enabled: !1 },
    x: { show: !1 },
    marker: { show: !1 },
  },
};

/**
 * Profit Line Chart
 */
 const profitlineChart: ChartType = {
  series: [
    { data: [12, 14, 2, 47, 42, 15, 47, 75, 65, 19, 14, 2, 47, 42, 15] },
  ],
  chart: { type: "line", height: 50, sparkline: { enabled: !0 } },
  colors: ['#5156be'],
  stroke: { curve: "smooth", width: 2 },
  tooltip: {
    fixed: { enabled: !1 },
    x: { show: !1 },
    marker: { show: !1 },
  },
};

const recentActivity = [
  {
    icon: 'bx bx-bitcoin font-size-24',
    date: '24/05/2021, 18:24:56',
    content: '0xb77ad0099e21d4fca87fa4ca92dda1a40af9e05d205e53f38bf026196fa2e431',
    coine: '+0.5 BTC',
    price: '$178.53'
  },
  {
    icon: 'mdi mdi-ethereum font-size-24',
    date: '24/05/2021, 18:24:56',
    content: '0xb77ad0099e21d4fca87fa4ca92dda1a40af9e05d205e53f38bf026196fa2e431',
    coine: '-20.5 ETH',
    price: '$3541.45'
  },
  {
    icon: 'bx bx-bitcoin font-size-24',
    date: '24/05/2021, 18:24:56',
    content: '0xb77ad0099e21d4fca87fa4ca92dda1a40af9e05d205e53f38bf026196fa2e431',
    coine: '+0.5 BTC',
    price: '$5791.45'
  },
  {
    icon: 'mdi mdi-litecoin font-size-24',
    date: '24/05/2021, 18:24:56',
    content: '0xb77ad0099e21d4fca87fa4ca92dda1a40af9e05d205e53f38bf026196fa2e431',
    coine: '-1.5 LTC',
    price: '$5791.45'
  },
  {
    icon: 'bx bx-bitcoin font-size-24',
    date: '24/05/2021, 18:24:56',
    content: '0xb77ad0099e21d4fca87fa4ca92dda1a40af9e05d205e53f38bf026196fa2e431',
    coine: '+0.5 BTC',
    price: '$5791.45'
  },
  {
    icon: 'mdi mdi-litecoin font-size-24',
    date: '24/05/2021, 18:24:56',
    content: '0xb77ad0099e21d4fca87fa4ca92dda1a40af9e05d205e53f38bf026196fa2e431',
    coine: '+.55 LTC',
    price: '$91.45'
  }
];

const News = [
  {
    icon: 'mdi mdi-currency-btc',
    avatar_icon: 'mdi-bitcoin',
    title: 'Bitcoin',
    content: 'Bitcoin prices fell sharply amid the global sell-off in equities. Negative news over the Bitcoin past week has dampened Bitcoin basics sentiment for bitcoin.'
  },
  {
    icon: 'mdi mdi-ethereum',
    avatar_icon: 'mdi-ethereum',
    title: 'ETH',
    content: 'Bitcoin prices fell sharply amid the global sell-off in equities. Negative news over the Bitcoin past week has dampened Bitcoin basics sentiment for bitcoin.'
  },
  {
    icon: 'mdi mdi-litecoin',
    avatar_icon: 'mdi-litecoin',
    title: 'Litecoin',
    content: 'Bitcoin prices fell sharply amid the global sell-off in equities. Negative news over the Bitcoin past week has dampened Bitcoin basics sentiment for bitcoin.'
  }
];

const transactionsAll = [
  {
    icon: 'bx-down-arrow-circle',
    title: 'Buy BTC',
    date: '14 Mar, 2021',
    coin: '0.016 BTC',
    amount: '$125.20'
  },
  {
    icon: 'bx-up-arrow-circle',
    title: 'Sell ETH',
    date: '15 Mar, 2021',
    coin: '0.56 ETH',
    amount: '$112.34'
  },
  {
    icon: 'bx-down-arrow-circle',
    title: 'Buy LTC',
    date: '16 Mar, 2021',
    coin: '1.88 LTC',
    amount: '$94.22'
  },
  {
    icon: 'bx-down-arrow-circle',
    title: 'Buy ETH',
    date: '17 Mar, 2021',
    coin: '0.42 ETH',
    amount: '$84.32'
  },
  {
    icon: 'bx-up-arrow-circle',
    title: 'Sell BTC',
    date: '18 Mar, 2021',
    coin: '0.018 BTC',
    amount: '$145.80'
  },
  {
    icon: 'bx-down-arrow-circle',
    title: 'Buy BTC',
    date: '14 Mar, 2021',
    coin: '0.016 BTC',
    amount: '$125.20'
  }
];

const transactionsBuy = [
  {
    icon: 'bx-down-arrow-circle',
    title: 'Buy BTC',
    date: '14 Mar, 2021',
    coin: '0.016 BTC',
    amount: '$125.20'
  },
  {
    icon: 'bx-down-arrow-circle',
    title: 'Buy BTC',
    date: '15 Mar, 2021',
    coin: '0.56 ETH',
    amount: '$112.34'
  },
  {
    icon: 'bx-down-arrow-circle',
    title: 'Buy LTC',
    date: '16 Mar, 2021',
    coin: '1.88 LTC',
    amount: '$94.22'
  },
  {
    icon: 'bx-down-arrow-circle',
    title: 'Buy ETH',
    date: '17 Mar, 2021',
    coin: '0.42 ETH',
    amount: '$84.32'
  },
  {
    icon: 'bx-down-arrow-circle',
    title: 'Sell BTC',
    date: '18 Mar, 2021',
    coin: '0.018 BTC',
    amount: '$145.80'
  },
  {
    icon: 'bx-down-arrow-circle',
    title: 'Buy BTC',
    date: '14 Mar, 2021',
    coin: '0.016 BTC',
    amount: '$125.20'
  }
];

const transactionsSell = [
  {
    icon: 'bx-up-arrow-circle',
    title: 'Buy BTC',
    date: '14 Mar, 2021',
    coin: '0.016 BTC',
    amount: '$125.20'
  },
  {
    icon: 'bx-up-arrow-circle',
    title: 'Buy BTC',
    date: '15 Mar, 2021',
    coin: '0.56 ETH',
    amount: '$112.34'
  },
  {
    icon: 'bx-up-arrow-circle',
    title: 'Buy LTC',
    date: '16 Mar, 2021',
    coin: '1.88 LTC',
    amount: '$94.22'
  },
  {
    icon: 'bx-up-arrow-circle',
    title: 'Buy ETH',
    date: '17 Mar, 2021',
    coin: '0.42 ETH',
    amount: '$84.32'
  },
  {
    icon: 'bx-up-arrow-circle',
    title: 'Sell BTC',
    date: '18 Mar, 2021',
    coin: '0.018 BTC',
    amount: '$145.80'
  },
  {
    icon: 'bx-up-arrow-circle',
    title: 'Buy BTC',
    date: '14 Mar, 2021',
    coin: '0.016 BTC',
    amount: '$125.20'
  }
];

export { walletOverview, investedOverview, marketOverview, recentActivity, walletlineChart, tradeslineChart, investedlineChart, profitlineChart, News, transactionsAll, transactionsBuy, transactionsSell };
