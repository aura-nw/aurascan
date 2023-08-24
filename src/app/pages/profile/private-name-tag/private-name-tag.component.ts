import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { Globals } from 'src/app/global/global';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { PopupCommonComponent } from 'src/app/shared/components/popup-common/popup-common.component';
import { PopupNameTagComponent } from '../popup-name-tag/popup-name-tag.component';

@Component({
  selector: 'app-private-name-tag',
  templateUrl: './private-name-tag.component.html',
  styleUrls: ['./private-name-tag.component.scss'],
})
export class PrivateNameTagComponent implements OnInit {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;

  countFav = 0;
  modalReference: any;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 5,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  templates: Array<TableTemplate> = [
    { matColumnDef: 'favorite', headerCellDef: 'Fav', headerWidth: 8 },
    { matColumnDef: 'address', headerCellDef: 'Address', headerWidth: 12 },
    { matColumnDef: 'type', headerCellDef: 'Type', headerWidth: 6 },
    { matColumnDef: 'name_tag', headerCellDef: 'Private Name Tag', headerWidth: 12 },
    { matColumnDef: 'createdAt', headerCellDef: 'Added Time', headerWidth: 10 },
    { matColumnDef: 'updatedAt', headerCellDef: 'Updated Time', headerWidth: 10 },
    { matColumnDef: 'action', headerCellDef: '', headerWidth: 8 },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);

  textSearch = '';
  searchSubject = new Subject();
  destroy$ = new Subject();
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  dataTable = [];

  constructor(
    public commonService: CommonService,
    public nameTagService: NameTagService,
    private dialog: MatDialog,
    private toastr: NgxToastrService,
    private global: Globals,
  ) {
    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageChange.selectPage(0);
      });
  }

  ngOnInit(): void {
    this.commonService.listNameTag = this.global.listNameTag;
    this.getListPrivateName();
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  resetFilterSearch() {
    this.textSearch = '';
    this.onKeyUp();
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListPrivateName();
  }

  getListPrivateName(nextKey = null) {
    this.textSearch = this.textSearch?.trim();
    const payload = {
      limit: 100,
      keyword: this.textSearch,
    };

    this.nameTagService.getListPrivateNameTag(payload).subscribe((res) => {
      this.countFav = res.data?.filter((k) => k.isFavorite === 1)?.length || 0;
      this.dataSource.data = res.data;
      this.pageData.length = res?.meta?.count || 0;
    });
  }

  openPopup(data = null) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'grant-overlay-panel';
    dialogConfig.disableClose = true;
    if (data) {
      dialogConfig.data = data;
    }
    let dialogRef = this.dialog.open(PopupNameTagComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.toastr.loading(result);
      }
    });
  }

  openPopupDelete(data) {
    let dialogRef = this.dialog.open(PopupCommonComponent, {
      panelClass: 'sizeNormal',
      data: {
        title: 'Remove Private Name Tag',
        content: 'Are you sure to remove private name tag for the address ' + data.address + ' ' + data.nameTag + ' ?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== 'canceled') {
        this.deleteNameTag(data.id);
      }
    });
  }

  deleteNameTag(id) {
    this.nameTagService.deletePrivateNameTag(id).subscribe((res) => {
      if (res.code && res.code !== 200) {
        this.toastr.error(res.message || 'Error');
        return;
      }

      this.toastr.successWithTitle('Private name tag removed!', 'Success');
      setTimeout(() => {
        this.getListPrivateName();
      }, 500);
    });
  }

  editPrivateNameTag() {}

  updateFavorite(data) {
    const payload = {
      id: data.id,
      isFavorite: !data.isFavorite,
    };

    this.nameTagService.updatePrivateNameTag(payload).subscribe((res) => {
      setTimeout(() => {
        this.getListPrivateName();
      }, 500);
    });
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }
}
