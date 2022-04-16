import { DatePipe } from '@angular/common';
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
import { TableTemplate } from '../../../../app/core/models/common.model';
import { shortenAddress } from '../../../../app/core/utils/common/shorten';
import { DATEFORMAT } from '../../../core/constants/common.constant';
import { PROPOSAL_VOTE } from '../../../core/constants/proposal.constant';
import { formatDateTime, formatTimeInWords, formatWithSchema } from '../../../core/helpers/date';
import { Globals } from '../../../global/global';

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
    { matColumnDef: 'voter', headerCellDef: 'Voter', isUrl: '/transaction', isShort: true },
    { matColumnDef: 'tx_hash', headerCellDef: 'TxHash', isUrl: '/transaction', isShort: true },
    { matColumnDef: 'option', headerCellDef: 'Answer' },
    { matColumnDef: 'created_at', headerCellDef: 'Time' },
  ];

  validatorsVotesTemplates: Array<TableTemplate> = [
    { matColumnDef: 'rank', headerCellDef: 'Rank', cssClass: 'box-rank' },
    { matColumnDef: 'validator', headerCellDef: 'Validator', isUrl: '/transaction', isShort: true },
    { matColumnDef: 'txHash', headerCellDef: 'TxHash', isUrl: '/transaction', isShort: true },
    { matColumnDef: 'answer', headerCellDef: 'Answer' },
    { matColumnDef: 'time', headerCellDef: 'Time' },
  ];

  depositorsTemplates: Array<TableTemplate> = [
    { matColumnDef: 'depositor', headerCellDef: 'Depositors', isUrl: '/transaction', isShort: true },
    { matColumnDef: 'tx_hash', headerCellDef: 'TxHash', isUrl: '/transaction', isShort: true },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'created_at', headerCellDef: 'Time' },
  ];

  displayedColumns: string[];

  template: Array<TableTemplate> = [];

  dataSource: MatTableDataSource<any>;
  length;
  pageSize = 20;
  pageIndex = 0;

  constructor(public global: Globals, private datePipe: DatePipe) {}
  ngOnDestroy(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource = new MatTableDataSource(this.data);
  }

  ngOnInit(): void {
    this.template = this.getTemplate(this.type);
    this.displayedColumns = this.getTemplate(this.type).map((template) => template.matColumnDef);

    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.sort = this.sort;
  }

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

  shortenAddress(address: string): string {
    return shortenAddress(address, 8);
  }

  getVoteValue(voteKey) {
    const vote = PROPOSAL_VOTE.find((vote) => vote.key === voteKey);
    return vote ? vote.value : voteKey;
  }

  getDateValue(created_at) {
    try {
      // return (
      //   formatTimeInWords(new Date(created_at).getTime()) +
      //   ' (' +
      //   this.datePipe.transform(created_at, DATEFORMAT.DATETIME_UTC) +
      //   ')'
      // );

      return [
        formatTimeInWords(new Date(created_at).getTime()),
        formatWithSchema(new Date(created_at).getTime(), DATEFORMAT.DATETIME_UTC)
      ]
    } catch (e) {
      return [created_at,''];
    }
  }
}
