import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-my-granters',
  templateUrl: './my-granters.component.html',
  styleUrls: ['./my-granters.component.scss'],
})

export class MyGrantersComponent implements OnInit {
  loading = true;
  isActive = true;
  textSearch = '';
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  dataSource = new MatTableDataSource<any>();
  templatesActive: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'TX HASH' },
    { matColumnDef: 'granter', headerCellDef: 'GRANTER' },
    { matColumnDef: 'type', headerCellDef: 'TYPE' },
    { matColumnDef: 'timestamp', headerCellDef: 'TIME' },
    { matColumnDef: 'limit', headerCellDef: 'SPEND LIMIT' },
    { matColumnDef: 'expiration', headerCellDef: 'EXPIRATION' },
    { matColumnDef: 'spendable', headerCellDef: 'SPENDABLE' },
  ];
  templatesInActive: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'TX HASH' },
    { matColumnDef: 'granter', headerCellDef: 'GRANTER' },
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
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;

  constructor(
    public commonService: CommonService,
    public global: Globals,
    private environmentService: EnvironmentService,
    private feeGrantService: FeeGrantService,
  ) {}

  async ngOnInit() {
    // await this.getGranteesData();

    this.currentAddress = 'aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx';
    this.getGrantersData();
  }

  async getGrantersData() {
    this.loading = true;
    if (this.isActive) {
      this.templates = this.templatesActive;
      this.displayedColumns = this.templatesActive.map((dta) => dta.matColumnDef);
    } else {
      this.templates = this.templatesInActive;
      this.displayedColumns = this.templatesInActive.map((dta) => dta.matColumnDef);
    }
    await this.getListGrant();
  }

  getListGrant() {
    let filterSearch = {};
    filterSearch['textSearch'] = '';
    filterSearch['isGranter'] = true;
    filterSearch['isActive'] = this.isActive;

    this.feeGrantService.getListFeeGrants(filterSearch, this.currentAddress, this.nextKey).subscribe((res) => {
      const { code, data } = res;
      if (code === 200) {
        this.nextKey = res.data.nextKey;
        data.grants.forEach((element) => {
          element.type = _.find(TYPE_TRANSACTION, { label: element.type })?.value;
          element.limit = element?.spend_limit?.amount || '0';
          element.spendable = element?.amount?.amount || '0';
        });

        if (this.dataSource?.data?.length > 0) {
          this.dataSource.data = [...this.dataSource.data, ...data.grants];
        } else {
          this.dataSource.data = [...data.grants];
        }

        // this.dataSource.data = data.grants;
        this.pageData.length = this.dataSource.data.length;
      }
      this.loading = false;
    });
  }

  searchToken(): void {
    this.textSearch !== '';
    if (this.textSearch && this.textSearch.length > 0) {
      // this.getListGrant(this.textSearch);
    }
  }

  resetFilterSearch() {
    this.textSearch = '';
    this.getListGrant();
  }

  pageEvent(e: PageEvent): void {
    const { pageIndex, pageSize } = e;
    const next = this.pageData.length <= (pageIndex + 2) * pageSize;
    this.pageData.pageIndex = e.pageIndex;

    if (next && this.nextKey && this.currentKey !== this.nextKey) {
      this.getGrantersData();
      this.currentKey = this.nextKey;
    }
  }

  async changeType(type: boolean) {
    this.isActive = type;
    this.dataSource.data = null;
    this.nextKey = null;
    await this.getGrantersData();
  }
}
