import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogConfig as MatDialogConfig,
} from '@angular/material/legacy-dialog';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { PAGE_EVENT, TOTAL_GROUP_TRACKING } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WatchListService } from 'src/app/core/services/watch-list.service';
import { isContract } from 'src/app/core/utils/common/validation';
import { Globals } from 'src/app/global/global';
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
    { matColumnDef: 'favorite', headerCellDef: 'Fav', headerWidth: 8 },
    { matColumnDef: 'address', headerCellDef: 'Address', headerWidth: 12 },
    { matColumnDef: 'type', headerCellDef: 'Type', headerWidth: 6 },
    { matColumnDef: 'public_name_tag', headerCellDef: 'Public Name Tag', headerWidth: 12 },
    { matColumnDef: 'private_name_tag', headerCellDef: 'Private Name Tag', headerWidth: 12 },
    { matColumnDef: 'group', headerCellDef: 'Group Tracking', headerWidth: 10 },
    { matColumnDef: 'updated_at', headerCellDef: 'Updated Time', headerWidth: 10 },
    { matColumnDef: 'action', headerCellDef: '', headerWidth: 8 },
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

  quota = this.environmentService.chainConfig.quotaSetPrivateName;

  constructor(
    public commonService: CommonService,
    public nameTagService: NameTagService,
    private dialog: MatDialog,
    private toastr: NgxToastrService,
    private global: Globals,
    private environmentService: EnvironmentService,
    private watchListService: WatchListService,
  ) {}

  ngOnInit(): void {
    const dataWatchList = localStorage.getItem('setAddressWatchList');
    if (dataWatchList && dataWatchList !== 'undefined') {
      const address = JSON.parse(dataWatchList);
      // localStorage.removeItem('setAddressWatchList');
      setTimeout(() => {
        this.openPopup({ address: address });
      }, 500);
    }

    this.commonService.listNameTag = this.global.listNameTag;
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
    this.isLoading = true;
    this.textSearch = this.textSearch?.trim();
    const payload = {
      limit: 10,
      keyword: this.textSearch || '',
      offset: this.pageData.pageIndex * this.pageData.pageSize,
    };

    this.watchListService.getListWatchList(payload).subscribe(
      (res) => {
        localStorage.setItem('lstWatchList', JSON.stringify(res?.data));
        this.dataSource.data = res.data;
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
      () => {
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      },
    );
  }

  openPopup(data = null, isEditMode = false) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'full-overlay-panel';
    dialogConfig.disableClose = true;
    console.log(data);
    if (data) {
      dialogConfig.data = data;
      dialogConfig.data['isEditMode'] = isEditMode;
    }
    dialogConfig.data = { ...dialogConfig.data, ...{ currentLength: this.pageData?.length } };
    let dialogRef = this.dialog.open(PopupWatchlistComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        setTimeout(() => {
          this.getWatchlist();
        }, 3000);
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
        this.pageEvent(this.pageData);
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

  urlType(address) {
    return isContract(address) ? '/contracts' : '/account';
  }
}