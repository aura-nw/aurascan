import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { NUMBER_CONVERT, PAGE_EVENT } from '../../../app/core/constants/common.constant';
import { CodeTransaction, StatusTransaction } from '../../../app/core/constants/transaction.enum';
import { TYPE_TRANSACTION } from '../../../app/core/constants/transaction.constant';
import { ResponseDto, TableTemplate } from '../../../app/core/models/common.model';
import { TransactionService } from '../../../app/core/services/transaction.service';
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexFill,
  ApexDataLabels,
  ApexLegend,
  ApexPlotOptions,
  ChartComponent
} from "ng-apexcharts";
import * as qrCode from 'qrcode';
import { PageEvent } from '@angular/material/paginator';
import { AccountService } from '../../../app/core/services/account.service';
import { TYPE_ACCOUNT } from '../../../app/core/constants/account.constant';
import { PageEventType } from '../../../app/core/constants/account.enum';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  fill: ApexFill;
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  colors: string[];
};

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss']
})

export class AccountDetailComponent implements OnInit {
  @ViewChild("walletChart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  @ViewChild(MatSort) sort: MatSort;
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  id;
  textSearch = '';
  templates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash_format', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'fee', headerCellDef: 'Fee' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' }
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any>;

  templatesToken: Array<TableTemplate> = [
    { matColumnDef: 'name', headerCellDef: 'Name' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'value', headerCellDef: 'Total Value' }
  ];
  displayedColumnsToken: string[] = this.templatesToken.map((dta) => dta.matColumnDef);
  dataSourceToken: MatTableDataSource<any>;
  dataSourceTokenBk: MatTableDataSource<any>;

  templatesDelegation: Array<TableTemplate> = [
    { matColumnDef: 'validator', headerCellDef: 'Validator' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'reward', headerCellDef: 'Reward' }
  ];
  displayedColumnsDelegation: string[] = this.templatesDelegation.map((dta) => dta.matColumnDef);
  dataSourceDelegation: MatTableDataSource<any>;
  pageType = '';

  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX
  };

  pageDataToken: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX
  };

  pageDataDelegation: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX
  };

  pageDataUnbonding: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX
  };

  pageDataRedelegation: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX
  };

  pageDataVesting: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX
  };

  length;
  pageSize = 5;
  pageIndex = 0;
  typeTransaction = TYPE_TRANSACTION;
  statusTransaction = StatusTransaction;
  pageEventType = PageEventType;
  type = 'All';
  imgGenerateQR: boolean;
  assetsType = TYPE_ACCOUNT;

  chartCustomOptions: { name: string; color: string }[] = [
    {
      name: "Available",
      color: "#9C6CFF",
    },
    {
      name: "Delegatable Vesting",
      color: "#783296",
    },
    {
      name: "Delegated",
      color: "#9C96C8",
    },
    {
      name: "Unbonding",
      color: "#C8C8C8",
    },
    {
      name: "Staking Reward",
      color: "#F0F0F0",
    }
  ];

  constructor(
    private transactionService: TransactionService,
    private route: ActivatedRoute,
    private accountService: AccountService) {
    this.chartOptions = {
      series: [0, 0],
      labels: this.chartCustomOptions.map((e) => e.name),
      colors: this.chartCustomOptions.map((e) => e.color),
      dataLabels: {
        enabled: false,
      },
      chart: {
        width: 280,
        type: "donut",
      },
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
          expandOnClick: false,
          offsetX: 0,
          offsetY: 0,
          customScale: 1,
          dataLabels: {
            offset: 0,
            minAngleToShowLabel: 1,
          },
          donut: {
            size: "55%",
            labels: {
              show: false,
              total: {
                show: false,
                showAlways: true,
                label: "Total Balance",
                fontSize: "18px",
                fontFamily: "Helvetica, Arial, sans-serif",
                fontWeight: 600,
                color: "#373d3f",
                formatter: function (w) {
                  return w.globals.seriesTotals.reduce((a, b) => {
                    return a + b;
                  }, 0);
                },
              },
            },
          },
        },
      },
      legend: {
        show: false,
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            plotOptions: {
              pie: {
                donut: {
                  labels: {
                    total: {
                      fontSize: "14px",
                    },
                  },
                },
              },
            },
          },
        },
      ],
    };
  }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Account' },
      { label: 'Detail', active: true }
    ];
    this.id = this.route.snapshot.paramMap.get('id');
    this.getList();
    this.getAccountDetail();
    this.createQRCode();
    this.chartOptions.series = [100, 50, 30, 20, 10];
  }

  changePage(page: any): void {
    this.dataSource = null;
    this.pageIndex = page.pageIndex;
    switch (page.pageEventType) {
      case this.pageEventType.Delegation:
        this.pageDataDelegation.pageIndex = page.pageIndex;
        this.getList();
        break;
      case this.pageEventType.Unbonding:
        this.pageDataUnbonding.pageIndex = page.pageIndex;
        // this.getListDelegators();
        break;
      case this.pageEventType.Redelegation:
        this.pageDataRedelegation.pageIndex = page.pageIndex;
        // this.getListPower();
        break;
      case this.pageEventType.Vestings:
        this.pageDataVesting.pageIndex = page.pageIndex;
        // this.getListPower();
        break;
      case this.pageEventType.Token:
        this.pageDataToken.pageIndex = page.pageIndex;
        // this.getListPower();
        break;
      default:
        this.pageData.pageIndex = page.pageIndex;
        this.getList();
        break;
    }
  }

  getList(): void {
    this.transactionService
      .txs(this.pageSize, this.pageIndex)
      .subscribe((res: ResponseDto) => {
        res.data.forEach((trans) => {
          const typeTrans = this.typeTransaction.find(f => f.label.toLowerCase() === trans.type.toLowerCase());
          trans.type = typeTrans?.value;
          trans.status = StatusTransaction.Fail;
          if (trans.code === CodeTransaction.Success) {
            trans.status = StatusTransaction.Success;
          }
          trans.tx_hash_format = trans.tx_hash.replace(trans.tx_hash.substring(6, trans.tx_hash.length - 6), '...');
          trans.amount = 0;
          //check exit amount of transaction
          if (trans.messages && trans.messages[0]?.amount) {
            let amount = trans.messages[0]?.amount[0]?.amount / NUMBER_CONVERT;
            trans.amount = trans.messages?.length === 1 ? amount : 'More';
          }
        });
        this.dataSource = new MatTableDataSource(res.data);
        this.length = res.meta.count;
        this.pageData.length = res.meta.count;
        this.dataSource.sort = this.sort;
      }
      );
  }

  getAccountDetail(): void {
    this.accountService.getAccoutDetail(this.pageSize, this.pageIndex)
      .subscribe(res => {
        this.dataSourceToken = new MatTableDataSource<any>(res);
        this.dataSourceTokenBk = this.dataSourceToken;
      })
  }

  searchToken(): void {
    if (this.textSearch.length > 0) {
      const data = this.dataSourceTokenBk.data.filter((f) =>
        f.name.toLowerCase().indexOf(this.textSearch.toLowerCase().trim()) > -1
      );
      this.dataSourceToken = this.dataSourceTokenBk;
      if (data.length > 0) {
        this.dataSourceToken = new MatTableDataSource(data);
      }
    }
    else {
      this.dataSourceToken = this.dataSourceTokenBk;
    }
  }

  /**
   * createQRCode
   */
  async createQRCode(): Promise<any> {
    try {
      const data = {
        values: this.id || '',
      };

      const canvas: any = document.getElementById('canvas');
      await qrCode.toDataURL(canvas, data.values, { width: 125, margin: 5 });
      // adding a log at center
      const imgDim = { width: 125, height: 125 };
      const context = canvas.getContext('2d');
      const logoImg: any = new Image();
      logoImg.crossOrigin = 'anonymous';
      // logoImg.src = imgBase64;
      logoImg.onload = () => {
        context.drawImage(
          '',
          canvas.width / 2 - imgDim.width / 2,
          canvas.height / 2 - imgDim.height / 2,
          imgDim.width,
          imgDim.height
        );
        context.save();
      };
      this.imgGenerateQR = true;
    } catch (e) { }
  }
}
