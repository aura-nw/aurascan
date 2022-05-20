import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TableTemplate } from '../../../core/models/common.model';
import { CommonService } from '../../../core/services/common.service';
import { shortenAddress } from '../../../core/utils/common/shorten';
import { PROPOSAL_VOTE } from '../../../core/constants/proposal.constant';
import { Globals } from '../../../global/global';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { TokenTab } from '../../../../app/core/constants/smart-contract.enum';

interface CustomPageEvent {
  next: number;
  type: string;
}

@Component({
  selector: 'app-smart-contract-table',
  templateUrl: './smart-contract-table.component.html',
  styleUrls: ['./smart-contract-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmartContractTableComponent implements OnInit, OnChanges {
  @Input() type: 'TABLE_TOKEN' | 'TABLE_ADDRESS';
  @Input() tabId: string;
  @Input() data: any[];
  @Input() length: number;
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;
  @Output() loadMore = new EventEmitter<CustomPageEvent>();

  tokenTransferTemplates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Txn Hash', isUrl: '/transaction', isShort: true },
    { matColumnDef: 'type', headerCellDef: 'Method', isShort: true},
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
    { matColumnDef: 'from_address', headerCellDef: 'From', isUrl: '/account'},
    { matColumnDef: 'to_address', headerCellDef: 'To', isUrl: '/account'},
    { matColumnDef: 'amount', headerCellDef: 'Amount', isShort: true},
  ];

  displayedColumns: string[];
  template: Array<TableTemplate> = [];

  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  pageSize = 5;
  pageIndex = 0;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  typeTokenTab = TokenTab;

  constructor(public global: Globals, public commonService: CommonService, private layout: BreakpointObserver) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tabId && !changes.tabId.firstChange && this.dataSource?.paginator) {
      this.pageChange.selectPage(0);
    }
    if (this.dataSource) {
      this.dataSource.data = this.data;
    } else {
      this.dataSource = new MatTableDataSource(this.data);
    }
  }

  ngOnInit(): void {
    this.template = this.getTemplate(this.type);
    this.displayedColumns = this.getTemplate(this.type).map((template) => template.matColumnDef);

    this.dataSource = new MatTableDataSource(this.data);
    // this.dateFormat = this.datePipe.transform(this.item?.timestamp, DATEFORMAT.DATETIME_UTC);
  }

  getTemplate(type: 'TABLE_TOKEN' | 'TABLE_ADDRESS'): Array<TableTemplate> {
    switch (type) {
      case 'TABLE_TOKEN':
        return this.tokenTransferTemplates;
      case 'TABLE_ADDRESS':
        // return this.depositorsTemplates;
      default:
        return [];
    }
  }

  shortenAddress(address: string): string {
    if (address) {
      return shortenAddress(address, 8);
    }
    return '';
  }

  getVoteValue(voteKey) {
    const vote = PROPOSAL_VOTE.find((vote) => vote.key === voteKey);
    return vote ? vote.value : 'Did not vote';
  }

  pageEvent(e: PageEvent): void {
    const { length, pageIndex, pageSize } = e;
    const next = length <= pageIndex * pageSize;

    if (next) {
      this.loadMore.emit({
        next: 1,
        type: this.type,
      });
    }
  }

  paginatorEmit(e): void {
    if (this.dataSource) {
      this.dataSource.paginator = e;
    } else {
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.paginator = e;
    }
  }

  getListData(): any[] {
    if (!(this.dataSource?.paginator && this.dataSource?.data)) {
      return [];
    }
    return this.dataSource.data.slice(
      this.dataSource.paginator.pageIndex * this.dataSource.paginator.pageSize,
      this.dataSource.paginator.pageIndex * this.dataSource.paginator.pageSize + this.dataSource.paginator.pageSize,
    );
  }
}
