import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Globals } from '../../../../../app/global/global';
import { DATEFORMAT } from '../../../../core/constants/common.constant';
import { PROPOSAL_STATUS } from '../../../../core/constants/status.constant';
import { WALLET_PROVIDER } from '../../../../core/constants/wallet.constant';
import { EnvironmentService } from '../../../../core/data-services/environment.service';
import { ResponseDto } from '../../../../core/models/common.model';
import { ProposalService } from '../../../../core/services/proposal.service';
import { WalletService } from '../../../../core/services/wallet.service';
import { ProposalVoteComponent } from '../../proposal-vote/proposal-vote.component';

@Component({
  selector: 'app-summary-info',
  templateUrl: './summary-info.component.html',
  styleUrls: ['./summary-info.component.scss'],
})
export class SummaryInfoComponent implements OnInit {
  @Input() proposalId: number;
  proposalDetail;
  statusConstant = PROPOSAL_STATUS;
  voteValue: { keyVote: number } = null;
  chainId = this.environmentService.apiUrl.value.chainId;

  constructor(
    private proposalService: ProposalService,
    private datePipe: DatePipe,
    public global: Globals,
    private walletService: WalletService,
    public dialog: MatDialog,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.getDetail();
  }

  getDetail(): void {
    this.proposalService.getProposalDetail(this.proposalId).subscribe((res: ResponseDto) => {
      this.proposalDetail = res.data;
      this.proposalDetail.pro_voting_start_time = this.datePipe.transform(
        this.proposalDetail.pro_voting_start_time,
        DATEFORMAT.DATETIME_UTC,
      );
      this.proposalDetail.pro_voting_end_time = this.datePipe.transform(
        this.proposalDetail.pro_voting_end_time,
        DATEFORMAT.DATETIME_UTC,
      );
      this.proposalDetail.pro_submit_time = this.datePipe.transform(
        this.proposalDetail.pro_submit_time,
        DATEFORMAT.DATETIME_UTC,
      );
      this.proposalDetail.pro_deposit_end_time = this.datePipe.transform(
        this.proposalDetail.pro_deposit_end_time,
        DATEFORMAT.DATETIME_UTC,
      );

      this.proposalDetail.pro_type = this.proposalDetail.pro_type.split('.').pop();

      this.proposalDetail.pro_total_vote =
        +this.proposalDetail.pro_votes_yes +
        +this.proposalDetail.pro_votes_no +
        +this.proposalDetail.pro_votes_no_with_veto +
        +this.proposalDetail.pro_votes_abstain;

      //vote bar data
      this.proposalDetail.pro_vote_yes_bar =
        (+this.proposalDetail.pro_votes_yes * 100) / +this.proposalDetail.pro_total_vote;
      this.proposalDetail.pro_vote_no_bar =
        (+this.proposalDetail.pro_votes_no * 100) / +this.proposalDetail.pro_total_vote;
      this.proposalDetail.pro_vote_no_with_veto_bar =
        (+this.proposalDetail.pro_votes_no_with_veto * 100) / +this.proposalDetail.pro_total_vote;
      this.proposalDetail.pro_vote_abstain_bar =
        (+this.proposalDetail.pro_votes_abstain * 100) / +this.proposalDetail.pro_total_vote;

      this.proposalDetail.yesPercent =
        (+this.proposalDetail.pro_votes_yes * 100) / +this.proposalDetail.pro_total_vote || 0;
      this.proposalDetail.noPercent =
        (+this.proposalDetail.pro_votes_no * 100) / +this.proposalDetail.pro_total_vote || 0;
      this.proposalDetail.noWithVetoPercent =
        (+this.proposalDetail.pro_votes_no_with_veto * 100) / +this.proposalDetail.pro_total_vote || 0;
      this.proposalDetail.abstainPercent =
        (+this.proposalDetail.pro_votes_abstain * 100) / +this.proposalDetail.pro_total_vote || 0;
    });
  }

  getStatus(key: string) {
    let resObj: { value: string; class: string } = null;
    const statusObj = this.statusConstant.find((s) => s.key === key);
    if (statusObj !== undefined) {
      resObj = {
        value: statusObj.value,
        class: statusObj.class,
      };
    }
    return resObj;
  }

  openVoteDialog(id: string, title: string) {
    if (this.walletService.wallet) {
      let dialogRef = this.dialog.open(ProposalVoteComponent, {
        height: '400px',
        width: '600px',
        data: { id, title, voteValue: this.voteValue },
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.voteValue = result;
      });
    } else {
      try {
        const connect = async () => {
          await this.walletService.connect(WALLET_PROVIDER.KEPLR, this.chainId);
        };
        connect();
      } catch (error) {
        console.error(error);
      }
    }
  }
}
