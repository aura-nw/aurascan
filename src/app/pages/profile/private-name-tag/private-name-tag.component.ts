import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { PopupNameTagComponent } from '../popup-name-tag/popup-name-tag.component';
import { ToastrService } from 'ngx-toastr';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { PrivateNameTagDto } from 'src/app/core/models/name-tag.model';

@Component({
  selector: 'app-private-name-tag',
  templateUrl: './private-name-tag.component.html',
  styleUrls: ['./private-name-tag.component.scss'],
})
export class PrivateNameTagComponent implements OnInit {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;

  modalReference: any;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  templates: Array<TableTemplate> = [
    { matColumnDef: 'favorite', headerCellDef: 'Fav.', headerWidth: 8 },
    { matColumnDef: 'address', headerCellDef: 'Address', headerWidth: 12 },
    { matColumnDef: 'type', headerCellDef: 'Type', headerWidth: 6 },
    { matColumnDef: 'name_tag', headerCellDef: 'Private Name Tag', headerWidth: 12 },
    { matColumnDef: 'created_at', headerCellDef: 'Added Time', headerWidth: 10 },
    { matColumnDef: 'update_time', headerCellDef: 'Updated Time', headerWidth: 10 },
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
    private modalService: NgbModal,
    private dialog: MatDialog,
    private toastr: NgxToastrService,
  ) {
    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageChange.selectPage(0);
      });
  }

  ngOnInit(): void {
    console.log(this.dataSource);
    this.getListPrivateName();
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  resetFilterSearch() {
    this.textSearch = '';
    this.onKeyUp();
  }

  pageEvent(pageIndex: number): void {
    this.getListPrivateName();
  }

  getListPrivateName() {
    this.textSearch = this.textSearch?.trim();
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageSize * this.pageData.pageIndex,
      keyword: this.textSearch,
    };

    this.nameTagService.getListPrivateNameTag(payload).subscribe((res) => {
      console.log(res);
      this.dataSource.data = res.data;
      this.pageData.length = res?.meta?.count || 0;
    });
  }

  openPopup() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'grant-overlay-panel';
    dialogConfig.disableClose = true;
    let dialogRef = this.dialog.open(PopupNameTagComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.toastr.loading(result);
      }
    });
  }
}
