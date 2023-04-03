import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ProposalService } from 'src/app/core/services/proposal.service';
import { ValidatorService } from 'src/app/core/services/validator.service';
import { TableTemplate } from '../../../../app/core/models/common.model';
import { CommonService } from '../../../../app/core/services/common.service';
import { shortenAddress } from '../../../../app/core/utils/common/shorten';
import { PROPOSAL_TABLE_MODE, PROPOSAL_VOTE } from '../../../core/constants/proposal.constant';
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
  @Input() type: PROPOSAL_TABLE_MODE;
  @Input() tabId: string;
  @Input() data: any[];
  @Input() length: number;
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Output() loadMore = new EventEmitter<CustomPageEvent>();
  @Output() isNextPage = new EventEmitter<boolean>();
  validatorImgArr;

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
  proposalMode = PROPOSAL_TABLE_MODE;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;

  constructor(
    public global: Globals,
    public commonService: CommonService,
    private layout: BreakpointObserver,
    private validatorService: ValidatorService,
    private environmentService: EnvironmentService,
    private proposalService: ProposalService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.dataSource) {
      this.dataSource.data = this.data;
    } else {
      this.dataSource = new MatTableDataSource(this.data);
    }

    let minus = 0;
    if (this.type === PROPOSAL_TABLE_MODE.DEPOSITORS) {
      minus = this.getUpdatePage(changes.data.currentValue?.length, this.proposalService.pageIndexObj[this.type]);
      this.pageChange?.selectPage((this.proposalService.pageIndexObj[this.type] || 0) - minus);
    } else if (this.type === PROPOSAL_TABLE_MODE.VOTES) {
      minus = this.getUpdatePage(
        changes.data.currentValue?.length,
        this.proposalService.pageIndexObj[this.type][this.tabId],
      );
      this.pageChange?.selectPage((this.proposalService.pageIndexObj[this.type][this.tabId] || 0) - minus);
    } else if (this.type === PROPOSAL_TABLE_MODE.VALIDATORS_VOTES) {
      const operatorAddArr = [];
      // get ValidatorAddressArr
      this.data.forEach((d) => {
        operatorAddArr.push(d.operator_address);
      });
      // get validator logo
      this.validatorService.getValidatorInfoByList(operatorAddArr).subscribe((res) => {
        if (res?.data) {
          this.validatorImgArr = res?.data;
          // push image into validator array
          this.dataSource.data.forEach((item) => {
            this.validatorImgArr.forEach((imgObj) => {
              if (imgObj.operator_address == item.operator_address) {
                item['image_url'] = imgObj.image_url;
              }
            });
          });
          this.cdr.markForCheck();
        }
      });

      minus = this.getUpdatePage(
        changes.data.currentValue?.length,
        this.proposalService.pageIndexObj[this.type][this.tabId],
      );
      this.pageChange?.selectPage((this.proposalService.pageIndexObj[this.type][this.tabId] || 0) - minus);
    }
  }

  getUpdatePage(data, page): number {
    let minus = 0;
    if (data % 25 !== 0 && Math.ceil(data / this.pageSize) <= page) {
      minus = 1;
    }
    return minus;
  }

  ngOnInit(): void {
    this.template = this.getTemplate(this.type);
    this.displayedColumns = this.getTemplate(this.type).map((template) => template.matColumnDef);
    this.dataSource = new MatTableDataSource(this.data);
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
    const { length, pageIndex, pageSize, previousPageIndex } = e;
    const next = length <= (pageIndex + 2) * pageSize;

    if (this.type === PROPOSAL_TABLE_MODE.DEPOSITORS) {
      this.proposalService.pageIndexObj[PROPOSAL_TABLE_MODE.DEPOSITORS] = pageIndex;
    } else if (this.type === PROPOSAL_TABLE_MODE.VOTES) {
      this.tabId = this.tabId || 'all';
      this.proposalService.pageIndexObj[PROPOSAL_TABLE_MODE.VOTES] = {};
      this.proposalService.pageIndexObj[PROPOSAL_TABLE_MODE.VOTES][this.tabId] = pageIndex;
    } else if (this.type === PROPOSAL_TABLE_MODE.VALIDATORS_VOTES) {
      this.tabId = this.tabId || 'all';
      this.proposalService.pageIndexObj[PROPOSAL_TABLE_MODE.VALIDATORS_VOTES] = {};
      this.proposalService.pageIndexObj[PROPOSAL_TABLE_MODE.VALIDATORS_VOTES][this.tabId] = pageIndex;
    }

    if (next) {
      this.isNextPage.emit(true);
      this.loadMore.emit({
        next: 1,
        type: this.type,
        tabId: this.tabId,
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
