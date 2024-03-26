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
} from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from '../../../../app/core/models/common.model';
import { shortenAddress } from '../../../../app/core/utils/common/shorten';
import { PROPOSAL_TABLE_MODE, PROPOSAL_VOTE } from '../../../core/constants/proposal.constant';

interface CustomPageEvent {
  next?: number;
  type: string;
  tabId: string;
  pageIndex?: number;
  pageSize?: number;
}

@Component({
  selector: 'app-proposal-table',
  templateUrl: './proposal-table.component.html',
  styleUrls: ['./proposal-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProposalTableComponent implements OnInit, OnChanges {
  @Input() type: PROPOSAL_TABLE_MODE;
  @Input() tabId: string;
  @Input() data: any[];
  @Input() length: number;
  @Input() errTxt: string;

  @Output() loadMore = new EventEmitter<CustomPageEvent>();
  @Output() isNextPage = new EventEmitter<boolean>();
  @Output() pageEventChange = new EventEmitter<CustomPageEvent>();

  votesTemplates: Array<TableTemplate> = [
    { matColumnDef: 'voter', headerCellDef: 'Voter', isUrl: '/address', isShort: true, isNameTag: true },
    { matColumnDef: 'txhash', headerCellDef: 'TxHash', isUrl: '/tx', isShort: true, desktopOnly: true },
    { matColumnDef: 'vote_option', headerCellDef: 'Answer' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time', desktopOnly: true },
  ];

  validatorsVotesTemplates: Array<TableTemplate> = [
    { matColumnDef: 'rank', headerCellDef: 'Rank' },
    {
      matColumnDef: 'validator_name',
      headerCellDef: 'Validator',
      isUrl: '/validators',
      paramField: 'operator_address',
      prefix: 'operator_address',
    },
    { matColumnDef: 'txhash', headerCellDef: 'TxHash', isUrl: '/tx', isShort: true, desktopOnly: true },
    { matColumnDef: 'vote_option', headerCellDef: 'Answer' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time', desktopOnly: true },
  ];

  depositorsTemplates: Array<TableTemplate> = [
    {
      matColumnDef: 'depositors',
      headerCellDef: 'Depositors',
      isUrl: '/address',
      isShort: true,
      desktopOnly: true,
      isNameTag: true,
    },
    { matColumnDef: 'hash', headerCellDef: 'TxHash', isUrl: '/tx', isShort: true },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];

  displayedColumns: string[];
  template: Array<TableTemplate> = [];
  dataSource: MatTableDataSource<any>;
  pageSize = 5;
  pageIndex = 0;
  pageValidatorIndex = 0;
  proposalMode = PROPOSAL_TABLE_MODE;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  coinInfo = this.environmentService.chainInfo.currencies[0];

  pageData: PageEvent = {
    length: 0,
    pageSize: 5,
    pageIndex: 1,
  };

  constructor(
    private layout: BreakpointObserver,
    private environmentService: EnvironmentService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.data.forEach((element) => {
      element.timestamp = element?.transaction?.timestamp || element.timestamp || element.updated_at;
      element.updated_at = null;
    });

    if (this.dataSource) {
      this.dataSource.data = this.data;
    } else {
      this.dataSource = new MatTableDataSource(this.data);
    }

    if (changes.tabId?.currentValue != changes.tabId?.previousValue) {
      this.pageData.pageIndex = 1;
    }
  }

  ngOnInit(): void {
    this.template = this.getTemplate(this.type);
    this.displayedColumns = this.getTemplate(this.type).map((template) => template.matColumnDef);
  }

  getTemplate(type: PROPOSAL_TABLE_MODE): Array<TableTemplate> {
    switch (type) {
      case PROPOSAL_TABLE_MODE.VOTES:
        return this.votesTemplates;
      case PROPOSAL_TABLE_MODE.DEPOSITORS:
        return this.depositorsTemplates;
      case PROPOSAL_TABLE_MODE.VALIDATORS_VOTES:
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
    return vote ? vote.value : 'Did not vote';
  }

  pageEvent(_index: number) {
    const { pageIndex, pageSize } = this.pageData;

    this.pageEventChange.emit({
      type: this.type,
      tabId: this.tabId,
      pageIndex: pageIndex - 1,
      pageSize,
    });
  }
}
