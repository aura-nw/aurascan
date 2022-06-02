import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { ITableContract } from 'src/app/core/models/contract.model';
import { Globals } from 'src/app/global/global';
import { DropdownElement } from 'src/app/shared/components/dropdown/dropdown.component';

export interface TableData {
  txHash: string;
  method: string;
  blockHeight: number;
  blockId: number;
  time: Date;
  from: string;
  to: string;
  label: string;
  value: number;
  fee: number;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent implements OnInit, OnChanges {
  elements: DropdownElement[] = [
    {
      image: 'assets/icons/icons-svg/white/arrow-right-2.svg',
      label: 'View OutGoing Txns',
      key: 0,
    },
    {
      image: 'assets/icons/icons-svg/white/arrow-left-2.svg',
      label: 'View Ingoing Txns',
      key: 1,
    },
    {
      image: 'assets/icons/icons-svg/white/contract.svg',
      label: 'View Contract Creation',
      key: 2,
    },
  ];

  @Input() data: TableData[];
  // data table
  @Input() contractInfo: ITableContract;
  @Input() templates!: Array<TableTemplate>;
  @Output() onViewSelected: EventEmitter<DropdownElement> = new EventEmitter();

  displayedColumns: string[];

  pageData: PageEvent;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  constructor(public translate: TranslateService, public global: Globals) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.loadTableData();
  }

  ngOnInit(): void {
    this.displayedColumns = this.templates?.map((dta) => dta.matColumnDef);
  }

  loadTableData() {
    this.pageData = {
      length: this.data.length,
      pageSize: PAGE_EVENT.PAGE_SIZE,
      pageIndex: PAGE_EVENT.PAGE_INDEX,
    };

    this.dataSource = new MatTableDataSource<any>(this.data);
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  viewSelected(e: DropdownElement): void {
    this.onViewSelected.emit(e);
  }
}
