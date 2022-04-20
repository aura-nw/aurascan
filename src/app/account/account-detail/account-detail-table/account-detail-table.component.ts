import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { formatDistanceToNowStrict } from 'date-fns';
import { DATEFORMAT } from '../../../core/constants/common.constant';
import { TableTemplate } from '../../../core/models/common.model';
import { Globals } from '../../../global/global';

@Component({
  selector: 'app-account-table',
  templateUrl: './account-detail-table.component.html',
  styleUrls: ['./account-detail-table.component.scss'],
})
export class AccountDetailTableComponent implements OnInit, OnChanges, AfterViewInit {
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
    private datePipe: DatePipe,
    public global: Globals,
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  ngOnChanges(): void {
    if (this.dataSource) {
      this.dataSource.data.forEach((f) => {
        if (f.completion_time) {
          f.completion_time_format = this.datePipe.transform(f.completion_time, DATEFORMAT.DATETIME_UTC);
        }
        if (f.vesting_schedule) {
          f.date_format = new Date(Number(f.vesting_schedule) * 1000);
          f.type_format = f.type.toLowerCase().indexOf('perio') > -1 ? 'Periodic' : 'Delayed';
          f.vesting_schedule_format = this.datePipe.transform(f.date_format, DATEFORMAT.DATETIME_UTC);
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

  getDateValue(time) {
    if (time) {
      try {
        return [formatDistanceToNowStrict(new Date(time).getTime())];
      } catch (e) {
        return [time, ''];
      }
    } else {
      return ['-', ''];
    }
  }
}
