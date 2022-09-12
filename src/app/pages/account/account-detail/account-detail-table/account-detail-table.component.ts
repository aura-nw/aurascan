import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../../core/services/common.service';
import { TableTemplate } from '../../../../core/models/common.model';
import { Globals } from '../../../../global/global';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { PageEventType } from '../../../../../app/core/constants/account.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ValidatorService } from 'src/app/core/services/validator.service';
import { STATUS_VALIDATOR } from 'src/app/core/constants/validator.enum';

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
  @Input() pageEventType: string;
  @Input() textNull: string = 'NO DATA';
  @Output() pageEvent = new EventEmitter<PageEvent>();

  pageType = PageEventType;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  currentPage = 0;
  statusValidator = STATUS_VALIDATOR;

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;

  dataSourceMobile: any[];

  constructor(
    public translate: TranslateService,
    public global: Globals,
    public commonService: CommonService,
    private layout: BreakpointObserver,
    private environmentService: EnvironmentService,
    private validatorService: ValidatorService,
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  ngOnChanges(): void {
    if (this.dataSource?.data) {
      this.dataSourceMobile = this.dataSource.data?.slice(
        this.pageData.pageIndex * this.pageData.pageSize,
        this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
      );

      this.dataSource.data.forEach((f) => {
        if (f.vesting_schedule) {
          f.date_format = new Date(Number(f.vesting_schedule) * 1000);
          if (f.type.toLowerCase().indexOf('continuous') > -1) {
            f.type_format = 'Continuous';
          } else if (f.type.toLowerCase().indexOf('period') > -1) {
            f.type_format = 'Period';
          } else {
            f.type_format = 'Delayed';
          }
        }
      });
    }
  }

  // handlePageEvent(event: any): void {
  //   if (this.pageData.pageSize !== event.pageSize) {
  //     event.pageIndex = 0;
  //   }
  //   this.pageData.pageIndex = event.pageIndex;
  //   this.pageData.pageSize = event.pageSize;
  //   event.pageEventType = this.pageEventType;
  //   this.pageEvent.emit(event);
  // }

  paginatorEmit(event: MatPaginator): void {
    this.dataSource.paginator = event;
  }

  paginatorEvent(event: PageEvent): void {
    this.dataSourceMobile = this.dataSource.data?.slice(
      event.pageIndex * event.pageSize,
      event.pageIndex * event.pageSize + event.pageSize,
    );
  }

  showPageEvent(event): void {
    this.currentPage = event?.target.innerText - 1;
  }

  getValidatorAvatar(validatorAddress: string): string {
    return this.validatorService.getValidatorAvatar(validatorAddress);
  }
}
