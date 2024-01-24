import { Component, HostListener, OnInit } from '@angular/core';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { sha256 } from 'js-sha256';
import * as _ from 'lodash';
import { Subject, map } from 'rxjs';
import { PAGE_EVENT, STORAGE_KEYS, TIMEOUT_ERROR, TITLE_LOGO } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { IBCService } from 'src/app/core/services/ibc.service';
import local from 'src/app/core/utils/storage/local';
import { convertTxIBC } from 'src/app/global/global';

@Component({
  selector: 'app-channel-detail',
  templateUrl: './channel-detail.component.html',
  styleUrls: ['./channel-detail.component.scss'],
})
export class ChannelDetailComponent implements OnInit {
  isLoading = true;
  channelDetail: any;
  errTxt: string;

  templates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'fee', headerCellDef: 'Fee' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
  ];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageDataTx: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 5,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  loadingTx = true;
  channel_id = '';
  counterparty_channel_id = '';
  counterInfo: any;
  destroy$ = new Subject<void>();
  maxDisplayChar = 22;
  TITLE_LOGO = TITLE_LOGO;

  coinInfo = this.environmentService.chainInfo.currencies[0];
  chainInfo = this.environmentService.chainInfo;

  constructor(
    public commonService: CommonService,
    private route: ActivatedRoute,
    private ibcService: IBCService,
    private environmentService: EnvironmentService,
  ) {}

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    local.setItem(STORAGE_KEYS.SHOW_POPUP_IBC, 'true');
  }

  ngOnInit() {
    if (this.environmentService.isMobile) {
      this.maxDisplayChar = 28;
    }

    this.route.params.subscribe((params) => {
      this.channel_id = params.channel_id;
      this.counterparty_channel_id = params.counterparty_channel_id;
    });

    this.getDataInit();

    //get data list info chain from local
    const listInfoChain = local.getItem<[]>(STORAGE_KEYS.LIST_INFO_CHAIN);
    this.ibcService.listInfoChain =
      this.ibcService.listInfoChain?.length > 0 ? this.ibcService.listInfoChain : listInfoChain;
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
    this.destroy$.next();
    this.destroy$.complete();
  }

  getDataInit() {
    this.getChannelDetail();
    this.getListTx();
  }

  getChannelDetail() {
    this.ibcService.getChannelDetail(this.channel_id, this.counterparty_channel_id).subscribe({
      next: (res) => {
        let data = res.ibc_channel[0];
        this.channelDetail = {
          counterParty: _.get(data, 'counterparty_channel_id'),
          operatingSince:
            _.get(data, 'ibc_connection.ibc_client.operating_since_1') ||
            _.get(data, 'ibc_connection.ibc_client.operating_since_2'),
          totalTx: _.get(data, 'total_tx.aggregate.count'),
          clientId: _.get(data, 'ibc_connection.ibc_client.client_id'),
        };
        const chainId = res?.ibc_channel[0]?.ibc_connection?.ibc_client?.counterparty_chain_id;
        this.counterInfo = this.ibcService.listInfoChain?.find((k) => k.chainId === chainId);
      },
      error: (e) => {
        this.isLoading = false;
        this.errTxt = e.status + ' ' + e.statusText;
      },
    });
  }

  getListTx(): void {
    const payload = {
      limit: 5,
      channel_id: this.channel_id,
      offset: this.pageDataTx.pageIndex * this.pageDataTx.pageSize,
    };
    this.ibcService
      .getListTxChannel(payload)
      .pipe(
        map((res) => {
          const txs = convertTxIBC(res, this.coinInfo);
          txs?.forEach((element) => {
            if (element['denom']?.includes('/')) {
              element['denom'] = 'ibc/' + sha256(element['denom'])?.toUpperCase();
              element['dataDenom'] = this.commonService.mappingNameIBC(element['denom']);
            } else {
              element['dataDenom'] = {
                decimals: this.coinInfo.coinDecimals,
                symbol:
                  element['denom'] === this.coinInfo.coinMinimalDenom ? this.coinInfo.coinDenom : element['denom'],
              };
            }
          });
          return { listTx: txs || [], total: res.total_tx.aggregate.count || 0 };
        }),
      )
      .subscribe({
        next: (res) => {
          this.dataSource = new MatTableDataSource<any>(res.listTx);
          this.pageDataTx.length = _.get(res, 'total') || 0;
        },
        error: (e) => {
          if (e.name === TIMEOUT_ERROR) {
            this.errTxt = e.message;
          } else {
            this.errTxt = e.status + ' ' + e.statusText;
          }
          this.loadingTx = false;
        },
        complete: () => {
          this.loadingTx = false;
        },
      });
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageDataTx.pageIndex = e.pageIndex;
    this.getListTx();
  }
}
