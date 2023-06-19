import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { tap } from 'rxjs/operators';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { PROPOSAL_STATUS } from 'src/app/core/constants/proposal.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { ProposalService } from 'src/app/core/services/proposal.service';
import { TokenService } from 'src/app/core/services/token.service';
import { shortenAddress } from 'src/app/core/utils/common/shorten';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';

@Component({
  selector: 'app-community-pool-proposal',
  templateUrl: './community-pool-proposal.component.html',
  styleUrls: ['./community-pool-proposal.component.scss'],
})
export class CommunityPoolProposalComponent implements OnInit {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'ID' },
    { matColumnDef: 'title', headerCellDef: 'Title' },
    { matColumnDef: 'status', headerCellDef: 'Status' },
    { matColumnDef: 'sender', headerCellDef: 'Sender' },
    { matColumnDef: 'recipient', headerCellDef: 'recipient' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'voting_end_time', headerCellDef: 'Voting End' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: 1,
  };
  length: number;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(
    tap((state) => {
      this.pageData = {
        length: PAGE_EVENT.LENGTH,
        pageSize: state.matches ? 5 : 10,
        pageIndex: 1,
      };

      this.getListProposal({ index: 1 });
    }),
  );
  dataSource: MatTableDataSource<any>;
  dataSourceMob: any[];
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  listCoin = this.environmentService.configValue.coins;
  statusConstant = PROPOSAL_STATUS;
  distributionAcc = '';

  constructor(
    public translate: TranslateService,
    public tokenService: TokenService,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
    private proposalService: ProposalService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.getAddressDistribution();
    // this.getListProposal({ index: 1 });
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

  getListProposal({ index }) {
    let payload = {
      limit: this.pageData.pageSize,
      offset: (index - 1) * this.pageData.pageSize,
      type: '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal',
    };
    this.proposalService.getProposalData2(payload).subscribe((res) => {
      if (res?.proposal) {
        this.dataSource = new MatTableDataSource(res.proposal);
      }
      this.length = res.proposal_aggregate.aggregate.count;
    });
  }
}
