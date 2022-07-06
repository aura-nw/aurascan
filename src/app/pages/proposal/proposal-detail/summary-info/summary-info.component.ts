import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { merge, Observable, of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { Globals } from '../../../../../app/global/global';
import { DATEFORMAT } from '../../../../core/constants/common.constant';
import {
  MESSAGE_WARNING,
  PROPOSAL_STATUS,
  PROPOSAL_VOTE,
  VOTING_FINAL_STATUS,
  VOTING_STATUS,
  VOTING_SUBTITLE,
} from '../../../../core/constants/proposal.constant';
import { EnvironmentService } from '../../../../core/data-services/environment.service';
import { IResponsesTemplates, ResponseDto } from '../../../../core/models/common.model';
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
  currentStatus = VOTING_FINAL_STATUS.REJECT;
  finalSubTitle = VOTING_SUBTITLE.PASS;
  currentSubTitle = '';
  isNotReached = true;

  constructor(
    private proposalService: ProposalService,
    private datePipe: DatePipe,
    public global: Globals,
    private walletService: WalletService,
    public dialog: MatDialog,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
    public commonService: CommonService,
    private numberPipe: DecimalPipe,
  ) {}

  ngOnInit(): void {
    // this.getDetail();
    this.getProposalDetail();
    this.walletService.wallet$.subscribe((wallet) => this.getVotedProposal());
  }

  getProposalTally(): Observable<any> {
    return this.proposalService.getProposalTally(this.proposalId).pipe(
      tap((tallRes: IResponsesTemplates<any>) => {
        this.updateVoteResultFromNode(tallRes.data);

        this.parsingProposalStatus(this.proposalDetail);
      }),
    );
  }
  /* 
Phúc, 9:12 AM
          this.commonService.status().subscribe((res) => {
            
          });

          this.proposalDetail.voted_percent =
            this.proposalDetail.yesPercent + this.proposalDetail.noPercent + this.proposalDetail.noWithVetoPercent;

          this.proposalDetail.voted = this.proposalDetail.pro_total_vote - this.proposalDetail.pro_votes_abstain;
*/
  getProposalDetail(): void {
    this.proposalService
      .getProposalDetail(this.proposalId)
      .pipe(
        mergeMap(({ data }: IResponsesTemplates<any>) => {
          if (data) {
            this.proposalDetail = this.makeProposalDataDetail(data);

            console.log('proposalDetail', this.proposalDetail);

            let { pro_status, pro_voting_end_time } = this.proposalDetail;

            if (pro_status === VOTING_STATUS.PROPOSAL_STATUS_VOTING_PERIOD) {
              const expiredTime = moment(pro_voting_end_time).diff(moment());
              if (expiredTime < 0) {
                return this.commonService.status().pipe(
                  mergeMap((res) => {
                    if (res?.data) {
                      this.proposalDetail.total_bonded_token = this.formatNumber(balanceOf(res.data.bonded_tokens));
                      this.proposalDetail.total_has_voted = this.formatNumber(this.proposalDetail.pro_total_vote) || 0;
                    }
                    return this.proposalService.getProposalDetailFromNode(this.proposalId).pipe(
                      tap((_) => {}),
                      mergeMap((res: IResponsesTemplates<any>) => {
                        pro_status = res.data.status;
                        return this.getProposalTally();
                      }),
                    );
                  }),
                );
              }
              this.votingBarLoading = true;
              return this.getProposalTally();
            }

            this.proposalDetail.yesPercent =
              (this.proposalDetail.pro_votes_yes * 100) / this.proposalDetail.pro_total_vote || 0;
            this.proposalDetail.noPercent =
              (this.proposalDetail.pro_votes_no * 100) / this.proposalDetail.pro_total_vote || 0;
            this.proposalDetail.noWithVetoPercent =
              (this.proposalDetail.pro_votes_no_with_veto * 100) / this.proposalDetail.pro_total_vote || 0;
            this.proposalDetail.abstainPercent =
              (this.proposalDetail.pro_votes_abstain * 100) / this.proposalDetail.pro_total_vote || 0;

            if (this.proposalDetail.pro_turnout >= this.proposalDetail.quorum) {
              if (this.proposalDetail.pro_votes_yes >= this.proposalDetail.voted / 2) {
                if (this.proposalDetail.pro_votes_no_with_veto < this.proposalDetail.voted / 3) {
                  this.finalSubTitle = VOTING_SUBTITLE.PASS;
                } else {
                  this.finalSubTitle = (VOTING_SUBTITLE as any).REJECT_1.toString().replace(
                    '{{proposalDetail.noWithVetoPercent}}',
                    this.proposalDetail.noWithVetoPercent,
                  );
                }
              } else {
                this.finalSubTitle = VOTING_SUBTITLE.REJECT_2;
              }
            } else {
              this.finalSubTitle = VOTING_SUBTITLE.REJECT_3;
            }
          }
          return of(null);
        }),
        map((e) => {
          if (e === null) {
          } else {
            this.updateVoteResultFromNode(e.data);

            this.parsingProposalStatus(this.proposalDetail);
          }
        }),
      )
      .subscribe();
  }

  makeProposalDataDetail(data) {
    const pro_votes_yes = balanceOf(+data.pro_votes_yes);
    const pro_votes_no = balanceOf(+data.pro_votes_no);
    const pro_votes_no_with_veto = balanceOf(+data.pro_votes_no_with_veto);
    const pro_votes_abstain = balanceOf(+data.pro_votes_abstain);

    return {
      pro_voting_start_time: this.datePipe.transform(data.pro_voting_start_time, DATEFORMAT.DATETIME_UTC),
      pro_voting_end_time: this.datePipe.transform(data.pro_voting_start_time, DATEFORMAT.DATETIME_UTC),
      pro_submit_time: this.datePipe.transform(data.pro_submit_time, DATEFORMAT.DATETIME_UTC),
      pro_deposit_end_time: this.datePipe.transform(data.pro_deposit_end_time, DATEFORMAT.DATETIME_UTC),
      initial_deposit: balanceOf(data.initial_deposit),
      pro_total_deposits: balanceOf(data.pro_total_deposits),
      pro_type: data.pro_type.split('.').pop(),
      pro_votes_yes,
      pro_votes_no,
      pro_votes_no_with_veto,
      pro_votes_abstain,
      pro_total_vote: pro_votes_yes + pro_votes_no + pro_votes_no_with_veto + pro_votes_abstain,

      ...data,
    };
  }

  parsingProposalStatus(proposalDetail): void {
    if (proposalDetail.pro_turnout >= proposalDetail.quorum) {
      if (proposalDetail.yesPercent >= proposalDetail.threshold) {
        if (proposalDetail.noWithVetoPercent < proposalDetail.veto_threshold) {
          // case pass
          this.currentStatus = VOTING_FINAL_STATUS.PASS;
          this.isNotReached = false;
          this.currentSubTitle =
            'This proposal may pass when the voting period is over because current quorum is more than ' +
            proposalDetail.quorum +
            ' and there are more than ' +
            proposalDetail.veto_threshold +
            ' of Yes votes.';
        } else {
          this.currentStatus = VOTING_FINAL_STATUS.REJECT;
          this.currentSubTitle = 'The proportion of NoWithVeto votes is superior to ' + proposalDetail.veto_threshold;
        }
      } else {
        this.currentStatus = VOTING_FINAL_STATUS.REJECT;
        this.currentSubTitle = 'The proportion of Yes votes is inferior to ' + proposalDetail.veto_threshold;
      }
    } else {
      this.currentStatus = VOTING_FINAL_STATUS.REJECT;
      this.currentSubTitle =
        'Current quorum is less than ' + proposalDetail.quorum + ' and this proposal requires more participation';
    }
  }

  getDetail(): void {
    this.proposalService.getProposalDetail(this.proposalId).subscribe((res: ResponseDto) => {
      if (res?.data) {
        console.log(res.data);

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

        this.proposalDetail.pro_votes_yes = balanceOf(+res.data.pro_votes_yes);
        this.proposalDetail.pro_votes_no = balanceOf(+res.data.pro_votes_no);
        this.proposalDetail.pro_votes_no_with_veto = balanceOf(+res.data.pro_votes_no_with_veto);
        this.proposalDetail.pro_votes_abstain = balanceOf(+res.data.pro_votes_abstain);

        this.proposalDetail.pro_total_vote =
          this.proposalDetail.pro_votes_yes +
          this.proposalDetail.pro_votes_no +
          this.proposalDetail.pro_votes_no_with_veto +
          this.proposalDetail.pro_votes_abstain;

        // if (this.proposalDetail.pro_status === VOTING_STATUS.PROPOSAL_STATUS_VOTING_PERIOD) {
        if (true) {
          const expiredTime = +moment(this.proposalDetail.pro_voting_end_time).format('x') - +moment().format('x');
          if (expiredTime < 0) {
            this.proposalService.getProposalDetailFromNode(this.proposalId).subscribe((res: ResponseDto) => {
              this.proposalDetail.pro_status = res.data.status;
            });
          }
          this.getVoteResult();

          if (this.proposalDetail.pro_turnout >= this.proposalDetail.quorum) {
            if (this.proposalDetail.yesPercent >= this.proposalDetail.threshold) {
              if (this.proposalDetail.noWithVetoPercent < this.proposalDetail.veto_threshold) {
                // case pass
                this.currentStatus = VOTING_FINAL_STATUS.PASS;
                this.isNotReached = false;
                this.currentSubTitle =
                  'This proposal may pass when the voting period is over because current quorum is more than ' +
                  this.proposalDetail.quorum +
                  ' and there are more than ' +
                  this.proposalDetail.veto_threshold +
                  ' of Yes votes.';
              } else {
                this.currentStatus = VOTING_FINAL_STATUS.REJECT;
                this.currentSubTitle =
                  'The proportion of NoWithVeto votes is superior to ' + this.proposalDetail.veto_threshold;
              }
            } else {
              this.currentStatus = VOTING_FINAL_STATUS.REJECT;
              this.currentSubTitle = 'The proportion of Yes votes is inferior to ' + this.proposalDetail.veto_threshold;
            }
          } else {
            this.currentStatus = VOTING_FINAL_STATUS.REJECT;
            this.currentSubTitle =
              'Current quorum is less than ' +
              this.proposalDetail.quorum +
              ' and this proposal requires more participation';
          }
        } else {
          // this.proposalDetail.pro_vote_yes_bar =
          //   (this.proposalDetail.pro_votes_yes * 100) / this.proposalDetail.pro_total_vote;
          // this.proposalDetail.pro_vote_no_bar =
          //   (this.proposalDetail.pro_votes_no * 100) / this.proposalDetail.pro_total_vote;
          // this.proposalDetail.pro_vote_no_with_veto_bar =
          //   (this.proposalDetail.pro_votes_no_with_veto * 100) / this.proposalDetail.pro_total_vote;
          // this.proposalDetail.pro_vote_abstain_bar =
          //   (this.proposalDetail.pro_votes_abstain * 100) / this.proposalDetail.pro_total_vote;

          this.proposalDetail.yesPercent =
            (this.proposalDetail.pro_votes_yes * 100) / this.proposalDetail.pro_total_vote || 0;
          this.proposalDetail.noPercent =
            (this.proposalDetail.pro_votes_no * 100) / this.proposalDetail.pro_total_vote || 0;
          this.proposalDetail.noWithVetoPercent =
            (this.proposalDetail.pro_votes_no_with_veto * 100) / this.proposalDetail.pro_total_vote || 0;
          this.proposalDetail.abstainPercent =
            (this.proposalDetail.pro_votes_abstain * 100) / this.proposalDetail.pro_total_vote || 0;

          if (this.proposalDetail.pro_turnout >= this.proposalDetail.quorum) {
            if (this.proposalDetail.pro_votes_yes >= this.proposalDetail.voted / 2) {
              if (this.proposalDetail.pro_votes_no_with_veto < this.proposalDetail.voted / 3) {
                this.finalSubTitle = VOTING_SUBTITLE.PASS;
              } else {
                this.finalSubTitle = (VOTING_SUBTITLE as any).REJECT_1.toString().replace(
                  '{{proposalDetail.noWithVetoPercent}}',
                  this.proposalDetail.noWithVetoPercent,
                );
              }
            } else {
              this.finalSubTitle = VOTING_SUBTITLE.REJECT_2;
            }
          } else {
            this.finalSubTitle = VOTING_SUBTITLE.REJECT_3;
          }
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
    const expiredTime = +moment(proposalDetail.pro_voting_end_time).format('x') - +moment().format('x');

    if (expiredTime > 0) {
      const account = this.walletService.getAccount();
      if (account) {
        this.proposalService.getStakeInfo(account.bech32Address).subscribe(({ data }) => {
          let warning: MESSAGE_WARNING;

          const { created_at } = data.result ? data.result : { created_at: null };

          warning = created_at
            ? +moment(created_at).format('x') < +moment(proposalDetail.pro_voting_start_time).format('x')
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

  /* 
            this.commonService.status().subscribe((res) => {
            if (res?.data) {
              this.proposalDetail.total_bonded_token = this.formatNumber(balanceOf(res.data.bonded_tokens));
              this.proposalDetail.total_has_voted = this.formatNumber(this.proposalDetail.pro_total_vote) || 0;
            }
          });

          this.proposalDetail.voted_percent =
            this.proposalDetail.yesPercent + this.proposalDetail.noPercent + this.proposalDetail.noWithVetoPercent;

          this.proposalDetail.voted = this.proposalDetail.pro_total_vote - this.proposalDetail.pro_votes_abstain;
  */

  calculatePercentVote(data) {
    const pro_votes_yes = balanceOf(+data.tally.yes);
    const pro_votes_no = balanceOf(+data.tally.no);
    const pro_votes_no_with_veto = balanceOf(+data.tally.no_with_veto);
    const pro_votes_abstain = balanceOf(+data.tally.abstain);

    const pro_total_vote = pro_votes_yes + pro_votes_no + pro_votes_no_with_veto + pro_votes_abstain;

    const yesPercent = (pro_votes_yes * 100) / pro_total_vote || 0;
    const noPercent = (pro_votes_no * 100) / pro_total_vote || 0;
    const noWithVetoPercent = (pro_votes_no_with_veto * 100) / pro_total_vote || 0;
    const abstainPercent = (pro_votes_abstain * 100) / pro_total_vote || 0;

    const voted_percent = yesPercent + noPercent + noWithVetoPercent;

    const voted = pro_total_vote - pro_votes_abstain;

    return {
      pro_votes_yes,
      pro_votes_no,
      pro_votes_no_with_veto,
      pro_votes_abstain,
      pro_total_vote,
      yesPercent,
      noPercent,
      noWithVetoPercent,
      abstainPercent,
      voted_percent,
      voted,
    };
  }

  updateVoteResultFromNode(nodeData) {
    if (!nodeData?.data?.tally) {
      return;
    }

    const {
      pro_votes_yes,
      pro_votes_no,
      pro_votes_no_with_veto,
      pro_votes_abstain,
      pro_total_vote,
      yesPercent,
      noPercent,
      noWithVetoPercent,
      abstainPercent,
      voted_percent,
      voted,
    } = this.calculatePercentVote(nodeData.proposalVoteTally);

    this.proposalDetail = {
      pro_votes_yes,
      pro_votes_no,
      pro_votes_no_with_veto,
      pro_votes_abstain,
      pro_total_vote,
      yesPercent,
      noPercent,
      noWithVetoPercent,
      abstainPercent,
      voted_percent,
      voted,
      ...this.proposalDetail,
    };

    this.votingBarLoading = false;
  }

  getVoteResult() {
    this.votingBarLoading = true;
    this.proposalService.getProposalTally(this.proposalId).subscribe(
      (res) => {
        if (!res?.data?.data?.tally) {
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

        this.proposalDetail.voted_percent =
          this.proposalDetail.yesPercent + this.proposalDetail.noPercent + this.proposalDetail.noWithVetoPercent;

        this.proposalDetail.voted = this.proposalDetail.pro_total_vote - this.proposalDetail.pro_votes_abstain;
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

    if (key === '') {
      let numberVote: string;
      numberVote = this.numberPipe.transform(abs, this.global.formatNumberOnlyDecimal);
      return (isNegative ? '-' : '') + numberVote + key;
    }
    return (isNegative ? '-' : '') + abs + key;
  }
}
