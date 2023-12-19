import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogConfig as MatDialogConfig,
} from '@angular/material/legacy-dialog';
import { PageEvent } from '@angular/material/paginator';
import * as _ from 'lodash';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { IBCService } from 'src/app/core/services/ibc.service';
import { PopupIBCDetailComponent } from './popup-ibc-detail/popup-ibc-detail.component';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-ibc',
  templateUrl: './ibc.component.html',
  styleUrls: ['./ibc.component.scss'],
})
export class IBCComponent implements OnInit {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;
  isLoading = true;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 5,
    pageIndex: 0,
  };
  textSearch = '';
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  errTxt: string;
  dataSourceMobile = [];
  relayerInfo: any;
  timeUpdate: string;

  searchSubject = new Subject();
  destroy$ = new Subject<void>();

  templates: Array<TableTemplate> = [
    { matColumnDef: 'no', headerCellDef: 'No', headerWidth: 8 },
    { matColumnDef: 'chain', headerCellDef: 'Chain', headerWidth: 28 },
    { matColumnDef: 'total_asset_transfer', headerCellDef: 'Total', headerWidth: 16 },
    { matColumnDef: 'receive_asset_transfer', headerCellDef: 'Receive', headerWidth: 16 },
    { matColumnDef: 'send_asset_transfer', headerCellDef: 'Send', headerWidth: 16 },
    { matColumnDef: 'status', headerCellDef: 'Status', headerWidth: 15 },
    { matColumnDef: 'channels', headerCellDef: 'Channels', headerWidth: 28 },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);

  constructor(
    private ibcService: IBCService,
    private dialog: MatDialog,
    private notificationsService: NotificationsService,
    public commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.getReplayerInfo();
    this.getListIBC();
    const listInfoChain = localStorage.getItem('listInfoChain');
    if (listInfoChain) {
      try {
        let data = JSON.parse(listInfoChain);
        this.ibcService.listInfoChain = data;
        this.getListInfoChain();
      } catch (e) {
        this.getListInfoChain();
      }
    } else {
      this.getListInfoChain();
    }

    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.pageData.pageIndex === PAGE_EVENT.PAGE_INDEX) {
          this.getListIBC();
        } else {
          this.pageChange.selectPage(0);
        }
      });

    // check back event
    const isShowPopup = localStorage.getItem('showPopupIBC');
    if (isShowPopup == 'true') {
      const data = localStorage.getItem('ibcDetail');
      if (data) {
        const ibcDetail = JSON.parse(data);
        this.openPopup(ibcDetail);
        localStorage.removeItem('showPopupIBC');
      }
    }
  }

  getReplayerInfo() {
    this.ibcService.getRelayerInfo().subscribe({
      next: (res) => {
        this.relayerInfo = {
          connectedChain: _.get(res, 'total_connected_chain.aggregate.count') || 0,
          totalOpen:
            (_.get(res, 'total_opening_channels.aggregate.sum.open_channel') || 0) +
              '/' +
              _.get(res, 'total_channels.aggregate.sum.total_channel') || 0,
          totalSend: _.get(res, 'total_send.aggregate.sum.send_asset_transfer') || 0,
          totalReceive: _.get(res, 'total_receive.aggregate.sum.receive_asset_transfer') || 0,
        };
      },
    });
  }

  getListIBC() {
    this.dataSource.data = [];
    this.textSearch = this.textSearch?.trim();
    const keySearch = this.textSearch ? `%${this.textSearch}%` : '';
    this.ibcService.getListIbcRelayer(keySearch).subscribe({
      next: (res) => {
        const m_view_ibc_relayer_statistic = _.get(res, 'm_view_ibc_relayer_statistic') || [];

        this.timeUpdate = this.timeUpdate || m_view_ibc_relayer_statistic[0]?.created_at;

        m_view_ibc_relayer_statistic?.forEach((element) => {
          const dataChain = this.ibcService.listInfoChain?.find((k) => k.chainId === element?.chain);
          element['chainName'] = dataChain?.chainName || element.chain;
          element['image'] = dataChain?.chainImage;
        });

        this.dataSource.data = m_view_ibc_relayer_statistic;
        this.pageData.length = m_view_ibc_relayer_statistic?.length;

        if (this.dataSource?.data) {
          let dataMobTemp = this.dataSource.data?.slice(
            this.pageData.pageIndex * this.pageData.pageSize,
            this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
          );
          if (dataMobTemp.length !== 0) {
            this.dataSourceMobile = dataMobTemp;
          } else {
            this.dataSourceMobile = this.dataSource.data?.slice(
              (this.pageData.pageIndex - 1) * this.pageData.pageSize,
              (this.pageData.pageIndex - 1) * this.pageData.pageSize + this.pageData.pageSize,
            );
          }
        }
      },
      error: (e) => {
        this.isLoading = false;
        this.errTxt = e.status + ' ' + e.statusText;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  resetSearch(): void {
    this.textSearch = '';
    this.dataSource.data = [];
    this.pageData.length = 0;
    this.pageChange.selectPage(0);
    this.dataSourceMobile = [];
    this.getListIBC();
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.dataSourceMobile = this.dataSource?.data?.slice(
      this.pageData?.pageIndex * this.pageData?.pageSize,
      this.pageData?.pageIndex * this.pageData?.pageSize + this.pageData?.pageSize,
    );
  }

  openPopup(data = null) {
    if (data.open_channel === 0) {
      return;
    }
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'full-overlay-panel';
    dialogConfig.disableClose = true;
    if (data) {
      localStorage.setItem('ibcDetail', JSON.stringify(data));
      dialogConfig.data = data;
    }

    if (this.notificationsService.isMobileMatched) {
      this.notificationsService.hiddenFooterSubject.next(true);
    }

    this.dialog.open(PopupIBCDetailComponent, dialogConfig);
  }

  getListInfoChain() {
    this.ibcService.getListInfoChain().subscribe({
      next: (res) => {
        this.ibcService.listInfoChain = res.data;
        localStorage.setItem('listInfoChain', JSON.stringify(res.data));
      },
    });
  }
}
