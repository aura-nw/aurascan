import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Globals } from '../../../../../app/global/global';
import { DATEFORMAT } from '../../../../core/constants/common.constant';
import { MESSAGE_WARNING, PROPOSAL_STATUS, PROPOSAL_VOTE } from '../../../../core/constants/proposal.constant';
import { EnvironmentService } from '../../../../core/data-services/environment.service';
import { ResponseDto } from '../../../../core/models/common.model';
import { CommonService } from '../../../../core/services/common.service';
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
  votingBarLoading = false;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  constructor(
    private proposalService: ProposalService,
    private datePipe: DatePipe,
    public global: Globals,
    private walletService: WalletService,
    public dialog: MatDialog,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
    public commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.getDetail();
    this.walletService.wallet$.subscribe((wallet) => this.getVotedProposal());
  }

  getDetail(): void {
    this.proposalService.getProposalDetail(this.proposalId).subscribe((res: ResponseDto) => {
      if (res?.data) {
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
        if (this.proposalDetail.pro_status === 'PROPOSAL_STATUS_VOTING_PERIOD') {
          const expiredTime = new Date(this.proposalDetail.pro_voting_end_time).getTime() - new Date().getTime();
          if (expiredTime < 0) {
            this.proposalService.getProposalDetailFromNode(this.proposalId).subscribe((res: ResponseDto) => {
              this.proposalDetail.pro_status = res.data.status;
            });
          }
          this.getVoteResult();
          this.commonService.status().subscribe((res) => {
            if (res?.data) {
              this.proposalDetail.total_bonded_token = this.formatNumber(balanceOf(res.data.bonded_tokens));
              this.proposalDetail.total_has_voted = this.formatNumber(this.proposalDetail.pro_total_vote);
            }
          });
        } else {
          this.proposalDetail.pro_votes_yes = balanceOf(+res.data.pro_votes_yes);
          this.proposalDetail.pro_votes_no = balanceOf(+res.data.pro_votes_no);
          this.proposalDetail.pro_votes_no_with_veto = balanceOf(+res.data.pro_votes_no_with_veto);
          this.proposalDetail.pro_votes_abstain = balanceOf(+res.data.pro_votes_abstain);

          this.proposalDetail.pro_total_vote =
            this.proposalDetail.pro_votes_yes +
            this.proposalDetail.pro_votes_no +
            this.proposalDetail.pro_votes_no_with_veto +
            this.proposalDetail.pro_votes_abstain;

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
        }
      }
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
      this.getDetail();
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
        setTimeout(() => {
          window.location.reload();
        }, 4000);
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
    this.votingBarLoading = true;
    this.proposalService.getProposalTally(this.proposalId).subscribe(
      (res) => {
        if (!res?.data?.proposalVoteTally?.tally) {
          return;
        }

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
      },
      (e) => {
        this.votingBarLoading = false;
      },
      () => {
        this.votingBarLoading = false;
      },
    );
  }

  formatNumber(number: number, args?: any): any {
    if (isNaN(number)) return null; // will only work value is a number
    if (number === null) return null;
    if (number === 0) return null;
    let abs = Math.abs(number);
    const rounder = Math.pow(10, 1);
    const isNegative = number < 0; // will also work for Negetive numbers
    let key = '';

    const powers = [
      { key: 'Q', value: Math.pow(10, 15) },
      { key: 'T', value: Math.pow(10, 12) },
      { key: 'B', value: Math.pow(10, 9) },
      { key: 'M', value: Math.pow(10, 6) },
      { key: 'K', value: 1000 },
    ];

    for (let i = 0; i < powers.length; i++) {
      let reduced = abs / powers[i].value;
      reduced = Math.round(reduced * rounder) / rounder;
      if (reduced >= 1) {
        abs = reduced;
        key = powers[i].key;
        break;
      }
    }
    return (isNegative ? '-' : '') + abs + key;
  }
}
