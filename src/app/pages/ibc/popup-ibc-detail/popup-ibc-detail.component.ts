import {Component, Inject, OnInit} from '@angular/core';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import {MatLegacyTableDataSource as MatTableDataSource} from '@angular/material/legacy-table';
import {PageEvent} from '@angular/material/paginator';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import * as _ from 'lodash';
import {map} from 'rxjs';
import {PAGE_EVENT, TIMEOUT_ERROR, TITLE_LOGO} from 'src/app/core/constants/common.constant';
import {Relayer} from 'src/app/core/constants/ibc.enum';
import {EnvironmentService} from 'src/app/core/data-services/environment.service';
import {TableTemplate} from 'src/app/core/models/common.model';
import {CommonService} from 'src/app/core/services/common.service';
import {IBCService} from 'src/app/core/services/ibc.service';
import {NotificationsService} from 'src/app/core/services/notifications.service';
import {isSafari} from 'src/app/core/utils/common/validation';

@Component({
  selector: 'app-popup-ibc-detail',
  templateUrl: './popup-ibc-detail.component.html',
  styleUrls: ['./popup-ibc-detail.component.scss'],
})
export class PopupIBCDetailComponent implements OnInit {
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 5,
    pageIndex: 0,
  };
  errTxt: string;
  isLoading = true;
  dataSourceMobile: any[];
  relayerType = Relayer;
  maxDisplayChar = 22;
  isSafari = isSafari();
  TITLE_LOGO = TITLE_LOGO;

  templates: Array<TableTemplate> = [
    {matColumnDef: 'channel_id', headerCellDef: 'channel', headerWidth: 20},
    {matColumnDef: 'counterparty_channel_id', headerCellDef: 'counter', headerWidth: 18},
    {matColumnDef: 'state', headerCellDef: 'State', headerWidth: 13},
    {matColumnDef: 'operatingSince', headerCellDef: 'Operating Since', headerWidth: 19},
    {matColumnDef: 'total', headerCellDef: 'Total', headerWidth: 13},
    {matColumnDef: 'receive', headerCellDef: 'Receive', headerWidth: 13},
    {matColumnDef: 'send', headerCellDef: 'Send', headerWidth: 13},
    {matColumnDef: 'action', headerCellDef: '', headerWidth: 10},
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);

  chainInfo = this.environmentService.chainInfo;
  counterInfo: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopupIBCDetailComponent>,
    public environmentService: EnvironmentService,
    public translate: TranslateService,
    private ibcService: IBCService,
    public commonService: CommonService,
    public route: Router,
    private notificationsService: NotificationsService,
  ) {
  }

  ngOnInit(): void {
    if (this.data) {
      this.getRelayerDetail();
      this.counterInfo = this.ibcService.listInfoChain?.find((k) => k.chainId === this.data?.chain);
    } else {
      this.isLoading = false;
    }

    if (this.environmentService.isMobile) {
      this.maxDisplayChar = 28;
    }
  }

  getRelayerDetail() {
    let payload = {
      limit: 100,
      offset: 0,
      chain_id: this.data?.chain,
    };

    this.ibcService
      .getListRelayerDetail(payload)
      .pipe(
        map((res) => {
          return res?.ibc_channel.map((element) => ({
            ...element,
            state:
              element['state'] === this.relayerType.OPEN || element['state'] === this.relayerType.STATE_OPEN
                ? 'Opened'
                : 'Close',
            operatingSince:
              _.get(element, 'ibc_connection.ibc_client.operating_since_1') ||
              _.get(element, 'ibc_connection.ibc_client.operating_since_2'),
          }));
        }),
      )
      .subscribe({
        next: (res) => {
          this.dataSource = new MatTableDataSource<any>(res);
          this.pageData.length = res?.length;

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
          if (e.name === TIMEOUT_ERROR) {
            this.errTxt = e.message;
          } else {
            this.errTxt = e.error.error.statusCode + ' ' + e.error.error.message;
          }
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  closeDialog(status = null) {
    this.dialogRef.close(status);
    this.notificationsService.hiddenFooterSubject.next(false);
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e): void {
    this.pageData.pageIndex = e.pageIndex;
    this.dataSourceMobile = this.dataSource.data?.slice(
      this.pageData?.pageIndex * this.pageData?.pageSize,
      this.pageData?.pageIndex * this.pageData?.pageSize + this.pageData?.pageSize,
    );
  }

  showDetail(data) {
    if (data.state === 'Close') {
      return;
    }
    this.notificationsService.hiddenFooterSubject.next(false);
    this.route.navigate(['/ibc-relayer', data.channel_id, data.counterparty_channel_id]);
    this.dialogRef.close();
  }
}
