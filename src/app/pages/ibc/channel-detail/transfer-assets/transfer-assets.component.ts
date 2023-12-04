import { Component, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { sha256 } from 'js-sha256';
import * as _ from 'lodash';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { PAGE_EVENT, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { IBCService } from 'src/app/core/services/ibc.service';
import { Globals } from 'src/app/global/global';
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
  pageIBCSend: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 5,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
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
  pageIBCReceive: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 5,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  dataSourceMobReceive: any[];
  isLoadingIBCReceive = true;
  textSearchReceive;
  isSearchReceive = false;

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
    public global: Globals,
    private environmentService: EnvironmentService,
    private ibcService: IBCService,
    private commonService: CommonService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.channel_id = params.channel_id;
      this.counterparty_channel_id = params.counterparty_channel_id;
    });
    this.getTransferSend();
    this.getTransferReceive();

    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.searchData();
      });
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
      next: (res) => {
        if (res.view_ibc_channel_detail_statistic?.length > 0) {
          const txs = this.convertTxAssets(res.view_ibc_channel_detail_statistic);
          this.dataIBCSending.data = [...txs];
          this.pageIBCSend.length = txs?.length || 0;
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

  searchData() {
    let result;
    if (this.isSearchReceive) {
      result = this.dataIBCReceiving.data.find((k) => k['dataDenom']?.display === this.textSearchReceive) || [];
      this.dataIBCReceiving.data = [...result];
    } else {
      result = this.dataIBCSending.data.find((k) => k['dataDenom']?.display === this.textSearchSend) || [];
      this.dataIBCSending.data = [...result];
    }
  }

  getTransferReceive() {
    const payload = {
      channel_id: this.channel_id,
      counterparty_channel_id: this.counterparty_channel_id,
      type: 'recv_packet',
    };
    this.ibcService.getTransferAsset(payload).subscribe({
      next: (res) => {
        if (res.view_ibc_channel_detail_statistic?.length > 0) {
          const txs = this.convertTxAssets(res.view_ibc_channel_detail_statistic);

          this.dataIBCReceiving.data = [...txs];
          this.pageIBCReceive.length = txs?.length || 0;
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

  onKeyUp(isSeachReceive = false) {
    if (isSeachReceive) {
      this.isSearchReceive = true;
      this.searchSubject.next(this.textSearchReceive);
    } else {
      this.isSearchReceive = false;
      this.searchSubject.next(this.textSearchSend);
    }
  }

  convertTxAssets(data) {
    const txs = data?.map((data) => {
      let denom = _.get(data, 'denom');
      let dataDenom;
      if (denom?.includes('/')) {
        denom = 'ibc/' + sha256(denom)?.toUpperCase();
        dataDenom = this.commonService.mappingNameIBC(denom);
      } else {
        dataDenom = { decimals: this.coinInfo.coinDecimals, symbol: denom === this.denom ? this.assetName : denom };
      }
      return {
        amount: _.get(data, 'amount'),
        denom,
        dataDenom,
        total_messages: _.get(data, 'total_messages'),
      };
    });
    return txs;
  }
}
