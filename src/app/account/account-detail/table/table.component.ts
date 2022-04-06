import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DATEFORMAT } from '../../../../app/core/constants/common.constant';
import { TableTemplate } from '../../../../app/core/models/common.model';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() dataSource: MatTableDataSource<any>;
  @Input() templates: Array<TableTemplate>;
  @Input() displayedColumns: string[];
  @Input() pageData: PageEvent;
  @Input() pageEventType: String;
  @Input() textNull: string = 'NO DATA';
  @Output() pageEvent = new EventEmitter<PageEvent>();

  constructor(
    public translate: TranslateService,
    private route: Router,
    private datePipe: DatePipe
  ) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  ngOnChanges(): void {
    if (this.dataSource) {
      this.dataSource.data.forEach((f) => {
        if (f.completion_time) {
          f.completion_time_format = this.datePipe.transform(f.completion_time, DATEFORMAT.DATETIME_UTC);
        }
        if (f.vesting_schedule) {
          f.vesting_schedule_format = this.datePipe.transform(f.vesting_schedule, DATEFORMAT.DATETIME_UTC);
        }
      });
    }
  }

  handlePageEvent(event: any): void {
    if (this.pageData.pageSize !== event.pageSize) {
      event.pageIndex = 0;
    }
    this.pageData.pageIndex = event.pageIndex;
    this.pageData.pageSize = event.pageSize;
    event.pageEventType = this.pageEventType;
    this.pageEvent.emit(event);
  }
}
