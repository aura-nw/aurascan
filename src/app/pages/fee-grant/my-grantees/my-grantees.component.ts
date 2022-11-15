import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import * as _ from 'lodash';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { TYPE_TRANSACTION } from 'src/app/core/constants/transaction.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { FeeGrantService } from 'src/app/core/services/feegrant.service';
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
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;

  constructor(
    public commonService: CommonService,
    public global: Globals,
    private environmentService: EnvironmentService,
    private dialog: MatDialog,
    private feeGrantService: FeeGrantService,
  ) {}

  async ngOnInit() {
    await this.getGranteesData();
  }

  async getGranteesData() {
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

  getListGrant(filterSearch = '') {
    this.feeGrantService.getListFeeGrants(filterSearch).subscribe((res) => {
      const { code, data } = res;
      if (code === 200) {
        data.grants.forEach((element) => {
          element.type = _.find(TYPE_TRANSACTION, { label: element.type })?.value;
          element.limit = element?.spend_limit?.amount || '0';
          element.spendable = element?.amount?.amount || '0';
        });
        this.dataSource.data = data.grants;
      }
      this.loading = false;
    });
  }

  searchToken(): void {
    this.textSearch !== '';
    if (this.textSearch && this.textSearch.length > 0) {
      this.getListGrant(this.textSearch);
    }
  }

  resetFilterSearch() {
    this.textSearch = '';
    this.getListGrant();
  }

  paginatorEmit(e: MatPaginator): void {
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
    await this.getGranteesData();
  }

  showRevoke(granteeAddress: string, granterAddress: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'grant-overlay-panel';
    dialogConfig.data = {
      granterAddress: granterAddress,
      granteeAddress: granteeAddress,
    };
    this.dialog.open(PopupRevokeComponent, dialogConfig);
  }

  openCreatePopup() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'grant-overlay-panel';
    dialogConfig.disableClose = true;
    dialogConfig.data = {};
    this.dialog.open(PopupAddGrantComponent, dialogConfig);
  }
}
