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
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ValidatorService } from 'src/app/core/services/validator.service';
import { TableTemplate } from '../../../../app/core/models/common.model';
import { CommonService } from '../../../../app/core/services/common.service';
import { shortenAddress } from '../../../../app/core/utils/common/shorten';
import { PROPOSAL_VOTE } from '../../../core/constants/proposal.constant';
import { Globals } from '../../../global/global';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';

interface CustomPageEvent {
  next: number;
  type: string;
  tabId: string;
}

@Component({
  selector: 'app-proposal-table',
  templateUrl: './proposal-table.component.html',
  styleUrls: ['./proposal-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProposalTableComponent implements OnInit, OnChanges {
  @Input() type: 'VOTES' | 'VALIDATORS_VOTES' | 'DEPOSITORS';
  @Input() tabId: string;
  @Input() data: any[];
  @Input() length: number;
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;
  @Output() loadMore = new EventEmitter<CustomPageEvent>();

  votesTemplates: Array<TableTemplate> = [
    { matColumnDef: 'voter_address', headerCellDef: 'Voter', isUrl: '/account', isShort: true },
    { matColumnDef: 'txhash', headerCellDef: 'TxHash', isUrl: '/transaction', isShort: true, desktopOnly: true },
    { matColumnDef: 'answer', headerCellDef: 'Answer' },
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
    { matColumnDef: 'tx_hash', headerCellDef: 'TxHash', isUrl: '/transaction', isShort: true, desktopOnly: true },
    { matColumnDef: 'answer', headerCellDef: 'Answer' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time', desktopOnly: true },
  ];

  depositorsTemplates: Array<TableTemplate> = [
    { matColumnDef: 'depositors', headerCellDef: 'Depositors', isUrl: '/account', isShort: true, desktopOnly: true },
    { matColumnDef: 'txhash', headerCellDef: 'TxHash', isUrl: '/transaction', isShort: true },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];

  displayedColumns: string[];
  template: Array<TableTemplate> = [];

  dataSource: MatTableDataSource<any>;
  pageSize = 5;
  pageIndex = 0;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;

  constructor(
    public global: Globals,
    public commonService: CommonService,
    private layout: BreakpointObserver,
    private validatorService: ValidatorService,
    private environmentService: EnvironmentService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.tabId && !changes.tabId.firstChange && this.dataSource?.paginator) || changes.data) {
      this.pageChange?.selectPage(0);
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
        tabId: this.tabId
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

  getValidatorAvatar(validatorAddress: string): string {
    return this.validatorService.getValidatorAvatar(validatorAddress);
  }
}
