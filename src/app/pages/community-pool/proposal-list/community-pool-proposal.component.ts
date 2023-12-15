import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Component, OnInit, ViewChild} from '@angular/core';
import {LegacyPageEvent as PageEvent, MatLegacyPaginator as MatPaginator} from '@angular/material/legacy-paginator';
import {MatLegacyTableDataSource as MatTableDataSource} from '@angular/material/legacy-table';
import {TranslateService} from '@ngx-translate/core';
import {tap} from 'rxjs/operators';
import {PAGE_EVENT, TIMEOUT_ERROR} from 'src/app/core/constants/common.constant';
import {PROPOSAL_STATUS, PROPOSAL_TYPE_COMMUNITY_POOL} from 'src/app/core/constants/proposal.constant';
import {EnvironmentService} from 'src/app/core/data-services/environment.service';
import {TableTemplate} from 'src/app/core/models/common.model';
import {CommonService} from 'src/app/core/services/common.service';
import {ProposalService} from 'src/app/core/services/proposal.service';
import {shortenAddress} from 'src/app/core/utils/common/shorten';
import {PaginatorComponent} from 'src/app/shared/components/paginator/paginator.component';

@Component({
  selector: 'app-community-pool-proposal',
  templateUrl: './community-pool-proposal.component.html',
  styleUrls: ['./community-pool-proposal.component.scss'],
})
export class CommunityPoolProposalComponent implements OnInit {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  templates: Array<TableTemplate> = [
    {matColumnDef: 'id', headerCellDef: 'ID'},
    {matColumnDef: 'title', headerCellDef: 'Title'},
    {matColumnDef: 'status', headerCellDef: 'Status'},
    {matColumnDef: 'sender', headerCellDef: 'Sender'},
    {matColumnDef: 'recipient', headerCellDef: 'recipient'},
    {matColumnDef: 'amount', headerCellDef: 'Amount'},
    {matColumnDef: 'voting_end_time', headerCellDef: 'Voting End'},
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: 1,
  };
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(
    tap((state) => {
      this.pageData = {
        length: PAGE_EVENT.LENGTH,
        pageSize: state.matches ? 5 : 10,
        pageIndex: 1,
      };

      this.getListProposal({index: 1});
    }),
  );
  length: number;
  dataSource: MatTableDataSource<any>;
  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  listCoin = this.environmentService.coins;
  statusConstant = PROPOSAL_STATUS;
  distributionAcc = '';
  isLoading = true;
  errTxt = null;

  constructor(
    public translate: TranslateService,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
    private proposalService: ProposalService,
    public commonService: CommonService,
  ) {
  }

  ngOnInit(): void {
    this.getAddressDistribution();
  }

  async getAddressDistribution() {
    const res = await this.commonService.getAccountDistribution();
    this.distributionAcc = res.data.account.base_account.address;
  }

  shortenAddress(address: string): string {
    if (address) {
      return shortenAddress(address, 8);
    }
    return '';
  }

  getStatus(key: string) {
    let resObj: { value: string; class: string; key: string } = null;
    const statusObj = this.statusConstant.find((s) => s.key === key);
    if (statusObj !== undefined) {
      resObj = {
        value: statusObj.value,
        class: statusObj.class,
        key: statusObj.key,
      };
    }
    return resObj;
  }

  getListProposal({index}) {
    let payload = {
      limit: this.pageData.pageSize,
      offset: (index - 1) * this.pageData.pageSize,
      type: [PROPOSAL_TYPE_COMMUNITY_POOL.V1BETA1, PROPOSAL_TYPE_COMMUNITY_POOL.V1],
    };
    this.proposalService.getProposalData(payload).subscribe({
      next: (res) => {
        if (res?.proposal) {
          let tempData = res.proposal;
          tempData?.forEach((pro) => {
            if (pro.content?.length > 0) {
              pro.recipient = pro.content[0].recipient;
              pro.amount = pro.content[0].amount;
            } else {
              pro.title = pro.content.title;
              pro.recipient = pro.content.recipient;
              pro.amount = pro.content.amount;
            }
          });
          this.dataSource = new MatTableDataSource(tempData);
        }
        this.length = res.proposal_aggregate.aggregate.count;
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.status + ' ' + e.statusText;
        }
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
