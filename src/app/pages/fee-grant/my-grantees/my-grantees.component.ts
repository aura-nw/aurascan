import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { NUMBER_CONVERT, PAGE_EVENT, TIME_OUT_CALL_API } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { TYPE_TRANSACTION } from 'src/app/core/constants/transaction.constant';
import { CodeTransaction } from 'src/app/core/constants/transaction.enum';
import { SIGNING_MESSAGE_TYPES } from 'src/app/core/constants/wallet.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { AccountService } from 'src/app/core/services/account.service';
import { CommonService } from 'src/app/core/services/common.service';
import { FeeGrantService } from 'src/app/core/services/feegrant.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { getFee } from 'src/app/core/utils/signing/fee';
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
  maxBalance = '0';

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
    private transactionService: TransactionService,
    private walletService: WalletService,
    private accountService: AccountService,
  ) {}

  ngOnInit() {
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.currentAddress = wallet.bech32Address;
        this.getGranteesData();
        this.getMaxBalance();
      } else {
        this.loading = false;
        this.currentAddress = null;
      }
    });
  }

  getGranteesData() {
    this.loading = true;
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
    let filterSearch = {};
    filterSearch['textSearch'] = this.textSearch;
    filterSearch['isGranter'] = false;
    filterSearch['isActive'] = this.isActive;

    this.feeGrantService.getListFeeGrants(filterSearch, this.currentAddress, this.nextKey, false).subscribe((res) => {
      const { code, data } = res;
      if (code === 200) {
        this.nextKey = res.data.nextKey;
        data.grants.forEach((element) => {
          element.type = _.find(TYPE_TRANSACTION, { label: element.type })?.value;
          element.limit = element?.spend_limit?.amount || '0';
          element.spendable = element?.amount?.amount || '0';
          element.reason = element?.status;
          if (element.reason === 'Available' && element?.expired) {
            element.reason = 'Expired';
          }
        });

        if (this.dataSource?.data?.length > 0 && this.pageData.pageIndex != 0) {
          this.dataSource.data = [...this.dataSource.data, ...data.grants];
        } else {
          this.dataSource.data = [...data.grants];
        }
        this.pageData.length = this.dataSource.data.length;
      }
      this.loading = false;
    });
  }

  searchToken(): void {
    this.textSearch !== '';
    if (this.textSearch && this.textSearch.length > 0) {
      this.dataSource.data = null;
      this.getListGrant();
    }
  }

  resetFilterSearch() {
    this.textSearch = '';
    this.dataSource.data = null;
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
    this.dataSource.data = null;
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
          this.checkDetailTx(result);
        }, 2000);
      }
    });
  }

  openCreatePopup() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'grant-overlay-panel';
    dialogConfig.disableClose = true;
    dialogConfig.data = { maxBalance: this.maxBalance };
    let dialogRef = this.dialog.open(PopupAddGrantComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.toastr.loading(result);
        setTimeout(() => {
          this.checkDetailTx(result);
        }, 2000);
      }
    });
  }

  async checkDetailTx(id) {
    const res = await this.transactionService.txsDetailLcd(id);
    let numberCode = res?.data?.tx_response?.code;
    let message = res?.data?.tx_response?.raw_log;
    if (numberCode !== undefined) {
      if (!!!numberCode && numberCode === CodeTransaction.Success) {
        message = this.translate.instant('NOTICE.SUCCESS_TRANSACTION');
        this.toastr.success(message);
        setTimeout(() => {
          this.getListGrant();
        }, TIME_OUT_CALL_API);
      } else {
        this.toastr.error(message);
      }
    }
  }

  getMaxBalance() {
    this.accountService.getAccountDetail(this.currentAddress).subscribe((res) => {
      this.maxBalance = (
        +res.data?.available +
        +res.data?.delegable_vesting -
        (Number(getFee(SIGNING_MESSAGE_TYPES.STAKE)) * this.chainInfo.gasPriceStep.high) / NUMBER_CONVERT
      ).toFixed(6);
    });
  }
}
