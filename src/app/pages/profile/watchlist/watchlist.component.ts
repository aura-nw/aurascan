import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogConfig as MatDialogConfig,
} from '@angular/material/legacy-dialog';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ENameTag, EScreen } from 'src/app/core/constants/account.enum';
import { PAGE_EVENT, STORAGE_KEYS, TIMEOUT_ERROR, TOTAL_GROUP_TRACKING } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WatchListService } from 'src/app/core/services/watch-list.service';
import { transferAddress } from 'src/app/core/utils/common/address-converter';
import local from 'src/app/core/utils/storage/local';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { PopupCommonComponent } from 'src/app/shared/components/popup-common/popup-common.component';
import { PopupWatchlistComponent } from './popup-watchlist/popup-watchlist.component';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss'],
})
export class WatchListComponent implements OnInit, OnDestroy {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;

  templates: Array<TableTemplate> = [
    { matColumnDef: 'favorite', headerCellDef: 'Fav', headerWidth: 65 },
    { matColumnDef: 'cosmosAddress', headerCellDef: 'Cosmos Add', headerWidth: 130 },
    { matColumnDef: 'evmAddress', headerCellDef: 'EVM Add', headerWidth: 130 },
    { matColumnDef: 'type', headerCellDef: 'Type', headerWidth: 80 },
    { matColumnDef: 'public_name_tag', headerCellDef: 'Public Name Tag', headerWidth: 150 },
    { matColumnDef: 'private_name_tag', headerCellDef: 'Private Name Tag', headerWidth: 150 },
    { matColumnDef: 'group', headerCellDef: 'Group Tracking', headerWidth: 120 },
    { matColumnDef: 'updated_at', headerCellDef: 'Updated Time', headerWidth: 120 },
    { matColumnDef: 'action', headerCellDef: '', headerWidth: 80 },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  textSearch = '';
  searchSubject = new Subject();
  destroy$ = new Subject<void>();
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  dataSourceMobile = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  totalGroupTracking = TOTAL_GROUP_TRACKING;
  isLoading = true;
  errTxt: string;
  ENameTag = ENameTag;
  EScreen = EScreen;

  quota = this.environmentService.chainConfig.quotaSetWatchList;
  prefixAdd = this.environmentService.chainInfo.bech32Config.bech32PrefixAccAddr;
  chainInfo = this.environmentService.chainInfo;

  constructor(
    public commonService: CommonService,
    public nameTagService: NameTagService,
    private dialog: MatDialog,
    private toastr: NgxToastrService,
    public environmentService: EnvironmentService,
    private watchListService: WatchListService,
  ) {}

  ngOnInit(): void {
    const dataWatchList = local.getItem(STORAGE_KEYS.SET_ADDRESS_WATCH_LIST);
    if (dataWatchList && dataWatchList !== 'undefined') {
      local.removeItem(STORAGE_KEYS.SET_ADDRESS_WATCH_LIST);
      setTimeout(() => {
        this.openPopup(dataWatchList);
      }, 500);
    }

    this.getWatchlist();
    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageChange.selectPage(0);
      });
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
    this.destroy$.next();
    this.destroy$.complete();
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  resetFilterSearch() {
    this.textSearch = '';
    this.onKeyUp();
  }

  getWatchlist() {
    this.textSearch = this.textSearch?.trim();
    const payload = {
      limit: 10,
      keyword: this.textSearch || '',
      offset: this.pageData.pageIndex * this.pageData.pageSize,
    };

    this.watchListService.getListWatchList(payload).subscribe(
      (res) => {
        local.setItem(STORAGE_KEYS.LIST_WATCH_LIST, res?.data);
        if (res.data?.length > 0) {
          res.data.forEach((data) => {
            const { accountAddress, accountEvmAddress } = transferAddress(
              this.chainInfo.bech32Config.bech32PrefixAccAddr,
              data.address,
            );
            data.cosmosAddress = accountAddress;
            data.evmAddress = accountEvmAddress;

            const nameTag = this.nameTagService.findNameTag(data.address);
            if (nameTag) {
              data.publicNameTag = nameTag['name_tag'];
              data.privateNameTag = nameTag['name_tag_private'];
            }
          });
        }
        this.dataSource.data = [...res.data];
        this.pageData.length = res?.meta?.count || 0;

        if (this.dataSource?.data) {
          let dataMobTemp = this.dataSource.data?.slice(
            this.pageData.pageIndex * this.pageData.pageSize,
            this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
          );
          if (dataMobTemp.length !== 0) {
            this.dataSourceMobile = dataMobTemp;
          } else {
            this.dataSourceMobile = this.dataSource.data?.slice(
              (this.pageData.pageIndex - 1) * this.pageData.pageSize,
              (this.pageData.pageIndex - 1) * this.pageData.pageSize + this.pageData.pageSize,
            );
          }
        }
      },
      (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.error.error.statusCode + ' ' + e.error.error.message;
        }
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      },
    );
  }

  openPopup(data = null) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'full-overlay-panel';
    dialogConfig.disableClose = true;
    if (data) {
      dialogConfig.data = data;
    }
    dialogConfig.data = { ...dialogConfig.data, ...{ currentLength: this.pageData?.length } };
    let dialogRef = this.dialog.open(PopupWatchlistComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        setTimeout(() => {
          this.getWatchlist();
        }, 2000);
      }
    });
  }

  openPopupRemove(data) {
    let dialogRef = this.dialog.open(PopupCommonComponent, {
      panelClass: 'sizeNormal',
      data: {
        title: 'Remove Address from watchlist',
        content: 'Are you sure to remove this address from your watchlist ' + data.address + '?',
        class: 'text--gray-1',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result !== 'canceled') {
        this.removeAddress(data.id);
      }
    });
  }

  removeAddress(id) {
    this.watchListService.deleteWatchList(id).subscribe((res) => {
      if (res?.code && res?.code !== 200) {
        this.toastr.error(res?.message || 'Error');
        return;
      }

      this.toastr.successWithTitle('Address removed from watchlist!', 'Success');
      setTimeout(() => {
        this.pageData.length--;
        this.pageChange.selectPage(0);
      }, 2000);
    });
  }

  updateFavorite(data) {
    const payload = {
      id: data.id,
      favorite: !data.favorite,
    };

    this.watchListService.updateWatchList(payload).subscribe((res) => {
      setTimeout(() => {
        this.getWatchlist();
      }, 2000);
    });
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getWatchlist();
  }

  urlType(data, address) {
    let result = '/address/';
    let linkAddress = address;
    if (data.type === 'contract') {
      result = data?.evmAddress ? '/evm-contracts/' : '/contracts/';
      linkAddress = data?.evmAddress || linkAddress;
    }
    return [result, linkAddress];
  }
}
