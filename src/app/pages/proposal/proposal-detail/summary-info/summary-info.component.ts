import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Globals } from '../../../../../app/global/global';
import { DATEFORMAT } from '../../../../core/constants/common.constant';
import { MESSAGE_WARNING, PROPOSAL_STATUS, PROPOSAL_VOTE } from '../../../../core/constants/proposal.constant';
import { EnvironmentService } from '../../../../core/data-services/environment.service';
import { ResponseDto } from '../../../../core/models/common.model';
import { ProposalService } from '../../../../core/services/proposal.service';
import { WalletService } from '../../../../core/services/wallet.service';
import { balanceOf } from '../../../../core/utils/common/parsing';
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
  voteConstant = PROPOSAL_VOTE;
  voteValue: { keyVote: string } = null;
  chainId = this.environmentService.apiUrl.value.chainId;
  proposalVotes: string;
  votingBarLoading = true;

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
    this.walletService.wallet$.subscribe((wallet) => this.getVotedProposal());
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
      this.proposalDetail.initial_deposit = balanceOf(this.proposalDetail.initial_deposit);
      this.proposalDetail.pro_total_deposits = balanceOf(this.proposalDetail.pro_total_deposits);
      this.proposalDetail.pro_type = this.proposalDetail.pro_type.split('.').pop();
      this.getVotedProposal();
      this.getVoteResult();
    });
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

  openVoteDialog(proposalDetail) {
    const id = proposalDetail.pro_id;
    const title = proposalDetail.pro_title;
    const expiredTime = new Date(proposalDetail.pro_voting_end_time).getTime() - new Date().getTime();
    if (expiredTime > 0) {
      const account = this.walletService.getAccount();
      if (account) {
        this.proposalService.getStakeInfo(account.bech32Address).subscribe(({ data }) => {
          let warning: MESSAGE_WARNING;

          const { created_at } = data.result ? data.result : { created_at: null };

          warning = created_at
            ? new Date(created_at) < new Date(proposalDetail.pro_voting_start_time)
              ? null
              : MESSAGE_WARNING.LATE
            : MESSAGE_WARNING.NOT_PARTICIPATE;

          this.openDialog({
            id,
            title,
            warning,
            voteValue: this.voteConstant.find((s) => s.key === this.voteValue.keyVote)?.voteOption || null,
          });
        });
      }
    } else {
      proposalDetail.pro_status = 'PROPOSAL_STATUS_REJECTED';
    }
  }

  openDialog(data): void {
    let dialogRef = this.dialog.open(ProposalVoteComponent, {
      width: data.warning ? '500px' : '431px',
      data: data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.voteValue = {
          keyVote: this.voteConstant.find((s) => s.voteOption === result.keyVote)?.key,
        };
        this.proposalVotes = result.keyVote;
        this.getVoteResult();
      }
    });
  }

  getVotedProposal() {
    const addr = this.walletService.wallet?.bech32Address || null;
    if (addr) {
      this.proposalService.getVotes(this.proposalId, addr).subscribe((res) => {
        this.proposalVotes = this.voteConstant.find((s) => s.key === res.data.proposalVote?.option)?.voteOption;
        this.voteValue = {
          keyVote: res.data.proposalVote?.option,
        };
      });
    } else {
      this.proposalVotes = null;
    }
  }

  getVoteResult() {
    this.proposalService.getProposalTally(this.proposalId).subscribe((res) => {
      this.votingBarLoading = true;
      this.proposalDetail.pro_votes_yes = balanceOf(+res.data.proposalVoteTally.tally.yes);
      this.proposalDetail.pro_votes_no = balanceOf(+res.data.proposalVoteTally.tally.no);
      this.proposalDetail.pro_votes_no_with_veto = balanceOf(+res.data.proposalVoteTally.tally.no_with_veto);
      this.proposalDetail.pro_votes_abstain = balanceOf(+res.data.proposalVoteTally.tally.abstain);

      this.proposalDetail.pro_total_vote =
        this.proposalDetail.pro_votes_yes +
        this.proposalDetail.pro_votes_no +
        this.proposalDetail.pro_votes_no_with_veto +
        this.proposalDetail.pro_votes_abstain;

      //vote bar data
      this.proposalDetail.pro_vote_yes_bar =
        (this.proposalDetail.pro_votes_yes * 100) / this.proposalDetail.pro_total_vote;
      this.proposalDetail.pro_vote_no_bar =
        (this.proposalDetail.pro_votes_no * 100) / this.proposalDetail.pro_total_vote;
      this.proposalDetail.pro_vote_no_with_veto_bar =
        (this.proposalDetail.pro_votes_no_with_veto * 100) / this.proposalDetail.pro_total_vote;
      this.proposalDetail.pro_vote_abstain_bar =
        (this.proposalDetail.pro_votes_abstain * 100) / this.proposalDetail.pro_total_vote;

      this.proposalDetail.yesPercent =
        (this.proposalDetail.pro_votes_yes * 100) / this.proposalDetail.pro_total_vote || 0;
      this.proposalDetail.noPercent =
        (this.proposalDetail.pro_votes_no * 100) / this.proposalDetail.pro_total_vote || 0;
      this.proposalDetail.noWithVetoPercent =
        (this.proposalDetail.pro_votes_no_with_veto * 100) / this.proposalDetail.pro_total_vote || 0;
      this.proposalDetail.abstainPercent =
        (this.proposalDetail.pro_votes_abstain * 100) / this.proposalDetail.pro_total_vote || 0;
      this.votingBarLoading = false;
    });
  }
}
