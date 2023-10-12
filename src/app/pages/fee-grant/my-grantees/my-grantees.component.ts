import { Component, OnInit } from '@angular/core';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogConfig as MatDialogConfig,
} from '@angular/material/legacy-dialog';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Router } from '@angular/router';
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
    pageIndex: 1,
  };
  isNoData = true;
  currentAddress = null;
  destroyed$ = new Subject<void>();
  timerGetFeeGrant: any;
  isSearchData = false;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;

  constructor(
    public commonService: CommonService,
    public global: Globals,
    public translate: TranslateService,
    private environmentService: EnvironmentService,
    private dialog: MatDialog,
    private feeGrantService: FeeGrantService,
    private toastr: NgxToastrService,
    private walletService: WalletService,
    private mappingErrorService: MappingErrorService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        window.addEventListener('keplr_keystorechange', () => {
          this.isNoData = true;
          const currentRoute = this.router.url;
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate([currentRoute]); // navigate to same route
          });
        });
        this.currentAddress = wallet.bech32Address;
        this.isNoData = false;
        this.getGranteesData();
        this.timerGetFeeGrant = setInterval(() => {
          this.getListGrant();
        }, 30000);
      } else {
        this.loading = false;
        this.currentAddress = null;
        this.pageEvent(0);
        this.dataSource.data = [];
      }
    });
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
    if (this.currentAddress) {
      if (this.isActive) {
        this.templates = this.templatesActive;
        this.displayedColumns = this.templatesActive.map((dta) => dta.matColumnDef);
      } else {
        this.templates = this.templatesInActive;
        this.displayedColumns = this.templatesInActive.map((dta) => dta.matColumnDef);
      }
      this.getListGrant();
    } else {
      this.loading = false;
    }
  }

  getListGrant() {
    let keySearch = (this.textSearch = this.textSearch?.trim());
    const addressNameTag = this.commonService.findNameTag(this.textSearch);
    if (addressNameTag?.length > 0) {
      keySearch = addressNameTag;
    }

    this.feeGrantService
      .getListFeeGrants(
        {
          limit: this.pageData.pageSize,
          granter: this.currentAddress,
          isActive: this.isActive,
          isGranter: false,
          offset: this.pageData.pageSize * (this.pageData.pageIndex - 1),
        },
        keySearch,
      )
      .subscribe({
        next: (res) => {
          if (!res) {
            return;
          }
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

          this.dataSource.data = res?.feegrant;
          this.pageData.length = res?.feegrant_aggregate?.aggregate?.count || 0;
          if (res.feegrant.length === 0 && this.isSearchData === false) {
            this.isNoData = true;
          }
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  searchToken(): void {
    this.isSearchData = true;
    if (this.textSearch && this.textSearch?.length > 0) {
      this.pageEvent(0);
    }
  }

  resetFilterSearch() {
    this.textSearch = '';
    this.pageEvent(0);
  }

  pageEvent(pageIndex: number): void {
    // reset page 1 if pageIndex = 0
    if (pageIndex === 0) {
      this.pageData.pageIndex = 1;
    }
    this.getGranteesData();
  }

  async changeType(type: boolean) {
    this.isActive = type;
    this.loading = true;
    this.isNoData = false;
    this.pageEvent(0);
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
          this.mappingErrorService.checkDetailTx(result).then(() => this.pageEvent(0));
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
          this.mappingErrorService.checkDetailTx(result).then(() => this.pageEvent(0));
        }, 2000);
      }
    });
  }
}
