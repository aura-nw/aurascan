import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../../app/core/services/common.service';
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
    public global: Globals,
    public commonService: CommonService,
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  ngOnChanges(): void {
    if (this.dataSource) {
      this.dataSource.data.forEach((f) => {
        if (f.vesting_schedule) {
          f.date_format = new Date(Number(f.vesting_schedule) * 1000);
          f.type_format = f.type.toLowerCase().indexOf('perio') > -1 ? 'Periodic' : 'Delayed';
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

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }
  paginatorEvent(event: PageEvent): void {}
}
