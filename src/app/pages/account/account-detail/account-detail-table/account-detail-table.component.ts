import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { TranslateService } from '@ngx-translate/core';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { PageEventType } from '../../../../../app/core/constants/account.enum';
import { TableTemplate } from '../../../../core/models/common.model';
import { CommonService } from '../../../../core/services/common.service';
import { Globals } from '../../../../global/global';

@Component({
  selector: 'app-account-detail-table',
  templateUrl: './account-detail-table.component.html',
  styleUrls: ['./account-detail-table.component.scss'],
})
export class AccountDetailTableComponent implements OnInit, OnChanges {
  @Input() dataSource: MatTableDataSource<any>;
  @Input() templates: Array<TableTemplate>;
  @Input() displayedColumns: string[];
  @Input() pageData: PageEvent;
  @Input() pageEventType: string;
  @Input() textNull: string = 'NO DATA';
  @Output() pageEvent = new EventEmitter<PageEvent>();

  pageType = PageEventType;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  dataSourceMobile: any[];

  constructor(
    public translate: TranslateService,
    public global: Globals,
    public commonService: CommonService,
    private layout: BreakpointObserver,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {}

  ngOnChanges(): void {
    if (this.dataSource?.data) {
      this.dataSourceMobile = this.dataSource.data?.slice(
        this.pageData.pageIndex * this.pageData.pageSize,
        this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
      );

      const operatorAddArr = [];
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
        // get ValidatorAddressArr
        if (this.pageEventType === 'Redelegation') {
          operatorAddArr.push(f.validator_src_address);
          operatorAddArr.push(f.validator_dst_address);
        } else {
          operatorAddArr.push(f.validator_address);
        }
      });
    }
  }

  paginatorEmit(event: MatPaginator): void {
    this.dataSource.paginator = event;
  }

  paginatorEvent(event: PageEvent): void {
    this.dataSourceMobile = this.dataSource.data?.slice(
      event.pageIndex * event.pageSize,
      event.pageIndex * event.pageSize + event.pageSize,
    );
  }
}
