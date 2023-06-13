import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { TYPE_TRANSACTION } from 'src/app/core/constants/transaction.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { FeeGrantService } from 'src/app/core/services/feegrant.service';
import { MappingErrorService } from 'src/app/core/services/mapping-error.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { Globals } from 'src/app/global/global';
import { PopupAddGrantComponent } from 'src/app/pages/fee-grant/popup-add-grant/popup-add-grant.component';
import { PopupRevokeComponent } from 'src/app/pages/fee-grant/popup-revoke/popup-revoke.component';

@Component({
  selector: 'app-my-grantees',
  templateUrl: './my-grantees.component.html',
  styleUrls: ['./my-grantees.component.scss'],
})
export class MyGranteesComponent implements OnInit {
  loading = true;
  isActive = true;
  textSearch = '';
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  dataSource = new MatTableDataSource<any>();
  templatesActive: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'TX HASH' },
    { matColumnDef: 'grantee', headerCellDef: 'GRANTEE' },
    { matColumnDef: 'type', headerCellDef: 'TYPE' },
    { matColumnDef: 'timestamp', headerCellDef: 'TIME' },
    { matColumnDef: 'limit', headerCellDef: 'SPEND LIMIT' },
    { matColumnDef: 'expiration', headerCellDef: 'EXPIRATION' },
    { matColumnDef: 'spendable', headerCellDef: 'SPENDABLE' },
    { matColumnDef: 'action', headerCellDef: '' },
  ];
  templatesInActive: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'TX HASH' },
    { matColumnDef: 'grantee', headerCellDef: 'GRANTEE' },
    { matColumnDef: 'type', headerCellDef: 'TYPE' },
    { matColumnDef: 'timestamp', headerCellDef: 'TIME' },
    { matColumnDef: 'limit', headerCellDef: 'SPEND LIMIT' },
    { matColumnDef: 'expiration', headerCellDef: 'EXPIRATION' },
    { matColumnDef: 'reason', headerCellDef: 'REASON' },
  ];
  templates: Array<TableTemplate>;
  displayedColumns: string[];
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  nextKey = null;
  currentKey = null;
  currentAddress = null;
  destroyed$ = new Subject();
  timerGetFeeGrant: any;

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  chainInfo = this.environmentService.configValue.chain_info;

  constructor(
    public commonService: CommonService,
    public global: Globals,
    private environmentService: EnvironmentService,
    private dialog: MatDialog,
    private feeGrantService: FeeGrantService,
    private toastr: NgxToastrService,
    public translate: TranslateService,
    private walletService: WalletService,
    private mappingErrorService: MappingErrorService,
  ) {}

  ngOnInit() {
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.currentAddress = wallet.bech32Address;
        this.getGranteesData();
      } else {
        this.loading = false;
        this.currentAddress = null;
      }
    });

    this.timerGetFeeGrant = setInterval(() => {
      this.getListGrant();
    }, 30000);
  }

  /**
   * ngOnDestroy
   */
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    clearInterval(this.timerGetFeeGrant);
  }

  getGranteesData() {
    if (this.isActive) {
      this.templates = this.templatesActive;
      this.displayedColumns = this.templatesActive.map((dta) => dta.matColumnDef);
    } else {
      this.templates = this.templatesInActive;
      this.displayedColumns = this.templatesInActive.map((dta) => dta.matColumnDef);
    }
    this.getListGrant();
  }

  getListGrant() {
    const payload = {
      limit: 100,
      granter: this.currentAddress,
      isActive: this.isActive,
      isGranter: false,
    };

    this.feeGrantService.getListFeeGrantsV2(payload, this.textSearch).subscribe(
      (res) => {
        res.feegrant?.forEach((element) => {
          element.type = _.find(TYPE_TRANSACTION, { label: element.type })?.value;
          element.spendable = element?.spend_limit || '0';
          element.limit = element.feegrant_histories[0]?.amount || '0';
          element.reason = element?.status;
          element.tx_hash = element?.transaction?.hash;
          element.timestamp = element?.transaction?.timestamp;
          element.origin_revoke_txhash = element?.revoke_tx?.hash;
          if (element?.expiration) {
            const timeCompare = new Date(element?.expiration).getTime();
            if (element.status === 'Available' && timeCompare < Date.now()) {
              element.reason = 'Expired';
            }
          }
        });

        if (
          this.dataSource?.data?.length > 0 &&
          this.dataSource.data.length !== res.feegrant?.length &&
          this.pageData.pageIndex != 0
        ) {
          this.dataSource.data = [...this.dataSource.data, ...res.feegrant];
        } else {
          this.dataSource.data = [...res.feegrant];
        }
        this.pageData.length = res.feegrant?.length;
      },
      (error) => {},
      () => {
        this.loading = false;
      },
    );
  }

  searchToken(): void {
    if (this.textSearch && this.textSearch.length > 0) {
      this.getListGrant();
    }
  }

  resetFilterSearch() {
    this.textSearch = '';
    this.getListGrant();
  }

  paginatorEmit(e: MatPaginator): void {
    if (this.dataSource.paginator) {
      e.page.next({
        length: this.dataSource.paginator.length,
        pageIndex: 0,
        pageSize: this.dataSource.paginator.pageSize,
        previousPageIndex: this.dataSource.paginator.pageIndex,
      });
      this.dataSource.paginator = e;
    } else {
      this.dataSource.paginator = e;
    }
  }

  pageEvent(e: PageEvent): void {
    const { pageIndex, pageSize } = e;
    const next = this.pageData.length <= (pageIndex + 2) * pageSize;
    this.pageData.pageIndex = e.pageIndex;

    if (next && this.nextKey && this.currentKey !== this.nextKey) {
      this.getGranteesData();
      this.currentKey = this.nextKey;
    }
  }

  async changeType(type: boolean) {
    this.isActive = type;
    this.dataSource.data = [];
    this.nextKey = null;
    await this.getGranteesData();
  }

  showRevoke(granteeAddress: string, granterAddress: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'grant-overlay-panel';
    dialogConfig.data = {
      granterAddress: granterAddress,
      granteeAddress: granteeAddress,
    };
    let dialogRef = this.dialog.open(PopupRevokeComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.toastr.loading(result);
        setTimeout(() => {
          this.mappingErrorService.checkDetailTx(result).then(() => this.getListGrant());
        }, 2000);
      }
    });
  }

  openCreatePopup() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'grant-overlay-panel';
    dialogConfig.disableClose = true;
    let dialogRef = this.dialog.open(PopupAddGrantComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.toastr.loading(result);
        setTimeout(() => {
          this.mappingErrorService.checkDetailTx(result).then(() => this.getListGrant());
        }, 2000);
      }
    });
  }
}
