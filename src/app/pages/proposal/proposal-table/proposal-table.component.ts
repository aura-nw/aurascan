import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TableTemplate } from 'src/app/core/models/common.model';

@Component({
  selector: 'app-proposal-table',
  templateUrl: './proposal-table.component.html',
  styleUrls: ['./proposal-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProposalTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() type: 'VOTES' | 'VALIDATORS_VOTES' | 'DEPOSITORS';

  @Input() data: any;

  @ViewChild(MatSort) sort: MatSort;
  votesTemplates: Array<TableTemplate> = [
    { matColumnDef: 'voter', headerCellDef: 'Voter' },
    { matColumnDef: 'txHash', headerCellDef: 'TxHash' },
    { matColumnDef: 'answer', headerCellDef: 'Answer' },
    { matColumnDef: 'time', headerCellDef: 'Time' },
  ];

  validatorsVotesTemplates: Array<TableTemplate> = [
    { matColumnDef: 'rank', headerCellDef: 'Rank' },
    { matColumnDef: 'validator', headerCellDef: 'Validator' },
    { matColumnDef: 'txHash', headerCellDef: 'TxHash' },
    { matColumnDef: 'answer', headerCellDef: 'Answer' },
    { matColumnDef: 'time', headerCellDef: 'Time' },
  ];

  depositorsTemplates: Array<TableTemplate> = [
    { matColumnDef: 'depositors', headerCellDef: 'Depositors' },
    { matColumnDef: 'txHash', headerCellDef: 'TxHash' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'time', headerCellDef: 'Time' },
  ];

  displayedColumns: string[];

  template: Array<TableTemplate> = [];

  dataSource: MatTableDataSource<any>;
  length;
  pageSize = 20;
  pageIndex = 0;

  constructor() {
    console.log('New Table');
  }
  ngOnDestroy(): void {
    console.log('ngOnDestroy');
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource = new MatTableDataSource(this.data);
  }

  ngOnInit(): void {
    this.template = this.getTemplate(this.type);
    this.displayedColumns = this.getTemplate(this.type).map((template) => template.matColumnDef);

    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.sort = this.sort;
  }

  openBlockDetail(e, row): void {}

  getTemplate(type: 'VOTES' | 'VALIDATORS_VOTES' | 'DEPOSITORS'): Array<TableTemplate> {
    switch (type) {
      case 'VOTES':
        return this.votesTemplates;
      case 'DEPOSITORS':
        return this.depositorsTemplates;
      case 'VALIDATORS_VOTES':
        return this.validatorsVotesTemplates;
      default:
        return [];
    }
  }
}
