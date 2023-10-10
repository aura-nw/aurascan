import { Component, OnInit } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { TYPE_TRANSACTION } from 'src/app/core/constants/transaction.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { FeeGrantService } from 'src/app/core/services/feegrant.service';
import { WalletService } from 'src/app/core/services/wallet.service';
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
    pageIndex: 1,
  };
  isNoData = true;
  isSearchData = false;
  currentAddress = null;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;

  constructor(
    public commonService: CommonService,
    public global: Globals,
    private environmentService: EnvironmentService,
    private feeGrantService: FeeGrantService,
    private walletService: WalletService,
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
        this.getGrantersData();
      } else {
        this.loading = false;
        this.currentAddress = null;
        this.pageEvent(0);
        this.dataSource.data = [];
      }
    });
  }

  getGrantersData() {
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
          isActive: this.isActive,
          isGranter: true,
          grantee: this.currentAddress,
          offset: this.pageData.pageSize * (this.pageData.pageIndex - 1),
        },
        keySearch,
      )
      .subscribe({
        next: (res) => {
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

          this.dataSource.data = res.feegrant;
          this.pageData.length = res.feegrant_aggregate.aggregate.count;
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
    if (this.textSearch && this.textSearch.length > 0) {
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
    this.getGrantersData();
  }

  async changeType(type: boolean) {
    this.isActive = type;
    this.loading = true;
    this.isNoData = false;
    this.pageEvent(0);
  }
}
