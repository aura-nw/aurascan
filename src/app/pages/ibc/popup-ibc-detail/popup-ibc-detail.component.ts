import { CommonModule } from '@angular/common';
import { Component, Inject, NgModule, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { MASK_CONFIG } from 'src/app/app.config';
import { PAGE_EVENT, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { RelayerType } from 'src/app/core/constants/ibc.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { PipeCutString } from 'src/app/core/pipes/common.pipe';
import { CommonService } from 'src/app/core/services/common.service';
import { IBCService } from 'src/app/core/services/ibc.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { MaterialModule } from 'src/app/material.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { TooltipCustomizeModule } from 'src/app/shared/components/tooltip-customize/tooltip-customize.module';
import { SharedModule } from 'src/app/shared/shared.module';

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
  relayerType = RelayerType;

  templates: Array<TableTemplate> = [
    { matColumnDef: 'channel_id', headerCellDef: 'channel', headerWidth: 20 },
    { matColumnDef: 'counterparty_channel_id', headerCellDef: 'counter', headerWidth: 18 },
    { matColumnDef: 'state', headerCellDef: 'State', headerWidth: 13 },
    { matColumnDef: 'operatingSince', headerCellDef: 'Operating Since', headerWidth: 19 },
    { matColumnDef: 'total', headerCellDef: 'Total', headerWidth: 13 },
    { matColumnDef: 'receive', headerCellDef: 'Receive', headerWidth: 13 },
    { matColumnDef: 'send', headerCellDef: 'Send', headerWidth: 13 },
    { matColumnDef: 'action', headerCellDef: '', headerWidth: 10 },
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
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.getRelayerDetail();
      this.counterInfo = this.ibcService.listInfoChain?.find((k) => k.chainId === this.data?.chain);
    } else {
      this.isLoading = false;
    }
  }

  getRelayerDetail() {
    let payload = {
      limit: 100,
      offset: 0,
      chainId: this.data?.chain,
    };

    this.ibcService.getListRelayerDetail(payload).subscribe({
      next: (res) => {
        res.ibc_channel?.forEach((element) => {
          element['state'] =
            element['state'] === this.relayerType.OPEN || element['state'] === this.relayerType.STATE_OPEN
              ? 'Opened'
              : 'Close';
          element['operatingSince'] =
            _.get(element, 'ibc_connection.ibc_client.operating_since_1') ||
            _.get(element, 'ibc_connection.ibc_client.operating_since_2');
        });

        this.dataSource = new MatTableDataSource<any>(res?.ibc_channel);
        this.pageData.length = res?.ibc_channel?.length;

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
      this.pageData.pageIndex * this.pageData.pageSize,
      this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
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

@NgModule({
  declarations: [PopupIBCDetailComponent],
  imports: [
    SharedModule,
    CommonPipeModule,
    CommonModule,
    FormsModule,
    TableNoDataModule,
    PaginatorModule,
    TranslateModule,
    MaterialModule,
    NgbNavModule,
    NgxMaskDirective,
    NgxMaskPipe,
    CommonPipeModule,
    TooltipCustomizeModule,
  ],
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
})
class PopupIBCDetailModule {}
