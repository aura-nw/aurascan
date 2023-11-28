import { Component, OnInit, ViewChild } from '@angular/core';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { PAGE_EVENT, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { TYPE_TRANSACTION } from 'src/app/core/constants/transaction.constant';
import { CodeTransaction, StatusTransaction } from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { IBCService } from 'src/app/core/services/ibc.service';
import { balanceOf } from 'src/app/core/utils/common/parsing';
import { Globals } from 'src/app/global/global';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';

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
  dataTx: any[];
  pageDataTx: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 5,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  loadingTx = true;
  channel_id = '';
  counterparty_channel_id = '';

  coinInfo = this.environmentService.chainInfo.currencies[0];
  chainInfo = this.environmentService.chainInfo;
  // denom = this.environmentService.chainInfo.currencies[0].coinDenom;

  constructor(
    public commonService: CommonService,
    public global: Globals,
    private route: ActivatedRoute,
    private ibcService: IBCService,
    private environmentService: EnvironmentService,
  ) {}
  

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.channel_id = params.channel_id;
      this.counterparty_channel_id = params.counterparty_channel_id;
    });
    this.getDataInit();
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
            _.get(data, 'ibc_connection.ibc_client.operating_since_1') || _.get(data, 'ibc_client.operating_since_2'),
          totalTx: _.get(data, 'total_tx.aggregate.count'),
          clientId: _.get(data, 'ibc_connection.ibc_client.client_id'),
        };
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
    this.ibcService.getListTxChannel(payload).subscribe({
      next: (res) => {
        if (res?.ibc_ics20?.length > 0) {
          const txs = this.convertTxIBC(res, this.coinInfo);
          this.dataSource = new MatTableDataSource<any>(txs);
          this.dataTx = txs;
        }
        this.pageDataTx.length = _.get(res, 'total_tx.aggregate.count') || 0;
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

  convertTxIBC(data, coinInfo) {
    const txs = _.get(data, 'ibc_ics20').map((data) => {
      let element = data.ibc_message.transaction_message;
      const code = _.get(element, 'transaction.code');
      const tx_hash = _.get(element, 'transaction.hash');
      let typeOrigin = _.get(element, 'type');

      let type = _.find(TYPE_TRANSACTION, { label: typeOrigin })?.value || typeOrigin.split('.').pop();
      if (type.startsWith('Msg')) {
        type = type?.replace('Msg', '');
      }

      const status = code == CodeTransaction.Success ? StatusTransaction.Success : StatusTransaction.Fail;
      const fee = balanceOf(_.get(element, 'transaction.fee[0].amount') || 0, coinInfo.coinDecimals).toFixed(
        coinInfo.coinDecimals,
      );
      const height = _.get(element, 'transaction.height');
      const timestamp = _.get(element, 'transaction.timestamp');
      let amountTemp = _.get(data, 'amount');
      let amount = balanceOf(amountTemp || 0, 6);
      const denom = _.get(data, 'denom');
      const decimals = 6;

      return {
        code,
        tx_hash,
        type,
        status,
        fee,
        height,
        timestamp,
        amount,
        amountTemp,
        denom,
        decimals
      };
    });
    return txs;
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageDataTx.pageIndex = e.pageIndex;
    this.getListTx();
  }
}
