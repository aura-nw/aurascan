import { Component, OnInit, ViewChild } from '@angular/core';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogConfig as MatDialogConfig,
} from '@angular/material/legacy-dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import * as _ from 'lodash';
import { PAGE_EVENT, STORAGE_KEYS } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { IBCService } from 'src/app/core/services/ibc.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import local from 'src/app/core/utils/storage/local';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { PopupIBCDetailComponent } from './popup-ibc-detail/popup-ibc-detail.component';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-ibc',
  templateUrl: './ibc.component.html',
  styleUrls: ['./ibc.component.scss'],
})
export class IBCComponent implements OnInit {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;
  isLoadingTable = true;
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
  relayerInfo = {
    connectedChain: 0,
    totalOpen: undefined,
    totalSend: 0,
    totalReceive: 0,
  };
  timeUpdate: string;
  rawData = [];
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
    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => {
        this.textSearch = this.textSearch?.trim();
        this.searchListIBC();
      });
    this.getReplayerInfo();
    this.getListIBC();

    const listInfoChain = local.getItem<[]>(STORAGE_KEYS.LIST_INFO_CHAIN);
    this.ibcService.listInfoChain = listInfoChain;
    this.getListInfoChain();

    // check back event
    const isShowPopup = local.getItem(STORAGE_KEYS.SHOW_POPUP_IBC);
    if (isShowPopup == 'true') {
      const ibcDetail = local.getItem(STORAGE_KEYS.IBC_DETAIL);
      if (ibcDetail) {
        this.openPopup(ibcDetail);
        local.removeItem(STORAGE_KEYS.SHOW_POPUP_IBC);
        local.removeItem(STORAGE_KEYS.IBC_DETAIL);
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
            (_.get(res, 'total_channels.aggregate.sum.total_channel') > 0
              ? _.get(res, 'total_channels.aggregate.sum.total_channel')
              : 0),
          totalSend: _.get(res, 'total_send.aggregate.sum.send_asset_transfer') || 0,
          totalReceive: _.get(res, 'total_receive.aggregate.sum.receive_asset_transfer') || 0,
        };
      },
    });
  }

  getListIBC() {
    this.ibcService.getListIbcRelayer().subscribe({
      next: (res) => {
        const m_view_ibc_relayer_statistic = _.get(res, 'm_view_ibc_relayer_statistic') || [];

        this.timeUpdate = this.timeUpdate || m_view_ibc_relayer_statistic[0]?.created_at;

        m_view_ibc_relayer_statistic?.forEach((element) => {
          const dataChain = this.ibcService.listInfoChain?.find((k) => k.chainId === element?.chain);
          element['chainName'] = dataChain?.chainName || element.chain;
          element['image'] = dataChain?.chainImage;
        });

        this.rawData = m_view_ibc_relayer_statistic;
        this.setDataList(m_view_ibc_relayer_statistic);
      },
      error: (e) => {
        this.isLoadingTable = false;
        this.errTxt = e.status + ' ' + e.statusText;
      },
      complete: () => {
        this.isLoadingTable = false;
      },
    });
  }

  setDataList(lstData) {
    this.dataSource.data = lstData;
    this.pageData.length = lstData?.length;

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
    this.pageChange.selectPage(0);
  }

  resetSearch(): void {
    this.textSearch = '';
    this.setDataList(this.rawData);
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
      local.setItem(STORAGE_KEYS.IBC_DETAIL, data);
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
        local.setItem(STORAGE_KEYS.LIST_INFO_CHAIN, res.data);
      },
    });
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  searchListIBC() {
    if (!this.textSearch) {
      this.setDataList(this.rawData);
      return;
    }

    const result =
      this.rawData?.filter((k) => k['chainName']?.toLowerCase().includes(this.textSearch?.toLowerCase())) || [];
    this.setDataList(result);
  }
}
