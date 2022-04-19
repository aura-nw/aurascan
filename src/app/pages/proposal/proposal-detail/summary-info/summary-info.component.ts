import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Globals } from '../../../../../app/global/global';
import { DATEFORMAT } from '../../../../core/constants/common.constant';
import { PROPOSAL_STATUS, PROPOSAL_VOTE } from '../../../../core/constants/proposal.constant';
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
  proposalVotes: {
    proId: number;
    vote: string | null;
  }[] = [];

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
      this.proposalVotes.push({
        proId: this.proposalDetail.pro_id,
        vote: null,
      });
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
    this.walletService.connectKeplr(this.chainId, (account) => {
      let dialogRef = this.dialog.open(ProposalVoteComponent, {
        height: '400px',
        width: '600px',
        data: { id, title, voteValue: this.voteConstant.find((s) => s.key === this.voteValue.keyVote)?.voteOption || null },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.voteValue = result;
          this.getDetail();
        }
      });
    });
    } else {
      window.location.reload();
    }
  }

  getVotedProposal() {
    const addr = this.walletService.wallet?.bech32Address || null;
    if (this.proposalVotes.length > 0 && addr) {
      forkJoin({
        0: this.proposalService.getVotes(this.proposalVotes[0]?.proId, addr),
      })
        .pipe(map((item) => Object.keys(item).map((u) => item[u].data?.proposalVote?.option)))
        .subscribe((res) => {
          this.proposalVotes = res.map((i, idx) => {
            this.voteValue = { keyVote: i };
            return {
              proId: this.proposalVotes[idx].proId,
              vote: this.voteConstant.find((s) => s.key === i)?.value || null,
            };
          });
        });
    } else {
      this.proposalVotes = this.proposalVotes.map((e) => ({
        ...e,
        vote: null,
      }));
    }
  }

  getVoteResult() {
    this.proposalService.getProposalTally(this.proposalId).subscribe((res) => {
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
    });
  }
}
