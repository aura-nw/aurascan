import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { sha256 } from 'js-sha256';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { IBCService } from 'src/app/core/services/ibc.service';
import { TokenService } from 'src/app/core/services/token.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';

@Component({
  selector: 'app-transfer-assets',
  templateUrl: './transfer-assets.component.html',
  styleUrls: ['./transfer-assets.component.scss'],
})
export class TransferAssetsComponent {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;

  dataIBCSending: MatTableDataSource<any> = new MatTableDataSource();
  templatesIBC: Array<TableTemplate> = [
    { matColumnDef: 'no', headerCellDef: 'No' },
    { matColumnDef: 'asset', headerCellDef: 'Asset' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'total_messages', headerCellDef: 'Messages' },
    { matColumnDef: 'amount', headerCellDef: 'Sending amount' },
  ];
  dataSourceMobSend: any[];
  displayedColumnsIBC: string[] = this.templatesIBC.map((dta) => dta.matColumnDef);
  isLoadingIBCSend = true;
  textSearchSend;
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;

  dataIBCReceiving: MatTableDataSource<any> = new MatTableDataSource();
  templatesIBCReceiving: Array<TableTemplate> = [
    { matColumnDef: 'no', headerCellDef: 'No' },
    { matColumnDef: 'asset', headerCellDef: 'Asset' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'total_messages', headerCellDef: 'Messages' },
    { matColumnDef: 'amount', headerCellDef: 'Receiving amount' },
  ];
  dataSourceMobReceive: any[];
  isLoadingIBCReceive = true;
  textSearchReceive;
  isSearchReceive = false;
  lstSendingRaw = [];
  lstSendingReceive = [];

  errTxtSend: string;
  errTxtReceive: string;
  searchSubject = new Subject();
  destroy$ = new Subject<void>();
  channel_id = '';
  counterparty_channel_id = '';

  chainInfo = this.environmentService.chainInfo;
  coinInfo = this.environmentService.chainInfo.currencies[0];
  denom = this.chainInfo.currencies[0].coinMinimalDenom;
  assetName = this.environmentService.chainInfo.currencies[0].coinDenom;

  constructor(
    private environmentService: EnvironmentService,
    private ibcService: IBCService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private tokenService: TokenService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.channel_id = params.channel_id;
      this.counterparty_channel_id = params.counterparty_channel_id;
    });
    this.getTransferSend();
    this.getTransferReceive();
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
    this.destroy$.next();
    this.destroy$.complete();
  }

  getTransferSend() {
    const payload = {
      channel_id: this.channel_id,
      counterparty_channel_id: this.counterparty_channel_id,
      type: 'send_packet',
    };
    this.ibcService.getTransferAsset(payload).subscribe({
      next: async (res) => {
        if (res.view_ibc_channel_detail_statistic?.length > 0) {
          const txs = await this.convertTxAssets(res.view_ibc_channel_detail_statistic);
          this.lstSendingRaw = txs;
          this.dataIBCSending.data = [...txs];
        }
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxtSend = e.message;
        } else {
          this.errTxtSend = e.status + ' ' + e.statusText;
        }
        this.isLoadingIBCSend = false;
      },
      complete: () => {
        this.isLoadingIBCSend = false;
      },
    });
  }

  searchSend() {
    if (!this.textSearchSend) {
      this.dataIBCSending.data = this.lstSendingRaw;
      return;
    }

    const result =
      this.lstSendingRaw?.filter(
        (k) =>
          k['dataDenom']?.name?.toLowerCase().includes(this.textSearchSend?.toLowerCase()) ||
          k['dataDenom']?.symbol?.toLowerCase().includes(this.textSearchSend?.toLowerCase()),
      ) || [];
    this.dataIBCSending.data = [...result];
  }

  searchReceive() {
    if (!this.textSearchReceive) {
      this.dataIBCReceiving.data = this.lstSendingReceive;
      return;
    }

    const result =
      this.lstSendingReceive?.filter(
        (k) =>
          k['dataDenom']?.name?.toLowerCase().includes(this.textSearchReceive?.toLowerCase()) ||
          k['dataDenom']?.symbol?.toLowerCase().includes(this.textSearchReceive?.toLowerCase()),
      ) || [];
    this.dataIBCReceiving.data = [...result];
  }

  getTransferReceive() {
    const payload = {
      channel_id: this.channel_id,
      counterparty_channel_id: this.counterparty_channel_id,
      type: 'recv_packet',
    };
    this.ibcService.getTransferAsset(payload).subscribe({
      next: async (res) => {
        if (res.view_ibc_channel_detail_statistic?.length > 0) {
          const txs = await this.convertTxAssets(res.view_ibc_channel_detail_statistic);
          this.lstSendingReceive = txs;
          this.dataIBCReceiving.data = [...txs];
        }
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxtReceive = e.message;
        } else {
          this.errTxtReceive = e.status + ' ' + e.statusText;
        }
        this.isLoadingIBCReceive = false;
      },
      complete: () => {
        this.isLoadingIBCReceive = false;
      },
    });
  }

  resetSearch(isSeachReceive = false) {
    if (isSeachReceive) {
      this.textSearchReceive = '';
      this.getTransferReceive();
    } else {
      this.textSearchSend = '';
      this.getTransferSend();
    }
  }

  getTokenImage(denom: string) {
    return new Promise((resolve) => {
      this.tokenService.getTokenDetail(denom).subscribe({
        next: (res) => {
          resolve(res?.image);
        },
        error: (e) => {
          resolve(null);
        }
      });
    });
  }

  async convertTxAssets(data) {
    const txs = await Promise.all(
      data?.map(async (data) => {
        let denom = _.get(data, 'denom');
        let dataDenom;
        if (denom?.includes('/')) {
          denom = 'ibc/' + sha256(denom)?.toUpperCase();
          dataDenom = this.commonService.mappingNameIBC(denom);
        } else {
          const image = await this.getTokenImage(denom);
          dataDenom = {
            decimals: this.coinInfo.coinDecimals,
            symbol: denom === this.denom ? this.assetName : denom,
            image,
          };
        }
        return {
          amount: _.get(data, 'amount'),
          denom,
          dataDenom,
          total_messages: _.get(data, 'total_messages'),
        };
      }),
    );
    return txs;
  }
}
