import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AfterViewChecked, Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { Observable, of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { Globals } from '../../../../../app/global/global';
import { DATEFORMAT } from '../../../../core/constants/common.constant';
import {
  MESSAGE_WARNING,
  PROPOSAL_STATUS,
  PROPOSAL_VOTE,
  VOTING_FINAL_STATUS,
  VOTING_QUORUM,
  VOTING_STATUS,
  VOTING_SUBTITLE,
} from '../../../../core/constants/proposal.constant';
import { EnvironmentService } from '../../../../core/data-services/environment.service';
import { IResponsesTemplates } from '../../../../core/models/common.model';
import { CommonService } from '../../../../core/services/common.service';
import { ProposalService } from '../../../../core/services/proposal.service';
import { WalletService } from '../../../../core/services/wallet.service';
import { balanceOf } from '../../../../core/utils/common/parsing';
import { ProposalVoteComponent } from '../../proposal-vote/proposal-vote.component';
const marked = require('marked');

@Component({
  selector: 'app-summary-info',
  templateUrl: './summary-info.component.html',
  styleUrls: ['./summary-info.component.scss'],
})
export class SummaryInfoComponent implements OnInit, AfterViewChecked {
  @Input() proposalId: number;
  proposalDetail;
  statusConstant = PROPOSAL_STATUS;
  currentStatusConstant = VOTING_FINAL_STATUS;
  voteConstant = PROPOSAL_VOTE;
  voteValue: { keyVote: string } = null;
  chainId = this.environmentService.configValue.chainId;
  proposalVotes: string;
  votingBarLoading = false;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  currentStatus: VOTING_STATUS | string = VOTING_STATUS.PROPOSAL_STATUS_REJECTED;
  finalSubTitle: VOTING_SUBTITLE | string = VOTING_SUBTITLE.PASS;
  currentSubTitle = '';
  isNotReached = true;
  quorumStatus = VOTING_QUORUM.NOT_REACHED;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;

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

  getProposalDetail(): void {
    this.proposalService
      .getProposalDetail(this.proposalId)
      .pipe(
        mergeMap(({ data }: IResponsesTemplates<any>) => {
          if (data) {
            this.proposalDetail = this.makeProposalDataDetail(data);

            let { pro_status, pro_voting_end_time } = this.proposalDetail;

            if (pro_status === VOTING_STATUS.PROPOSAL_STATUS_VOTING_PERIOD) {
              const expiredTime = moment(pro_voting_end_time).diff(moment());

              return this.commonService.status().pipe(
                mergeMap((res) => {
                  if (res?.data) {
                    this.proposalDetail.total_bonded_token = balanceOf(res.data.bonded_tokens);
                  }

                  this.votingBarLoading = true;

                  if (!(expiredTime < 0)) {
                    return this.getProposalTally();
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

            const {
              pro_votes_yes,
              pro_total_vote,
              pro_votes_no,
              pro_votes_no_with_veto,
              pro_votes_abstain,
              pro_turnout,
              quorum,
            } = this.proposalDetail;

            const yesPercent = (pro_votes_yes * 100) / pro_total_vote || 0;
            const noPercent = (pro_votes_no * 100) / pro_total_vote || 0;
            const noWithVetoPercent = (pro_votes_no_with_veto * 100) / pro_total_vote || 0;
            const abstainPercent = (pro_votes_abstain * 100) / pro_total_vote || 0;

            this.proposalDetail = {
              ...this.proposalDetail,
              yesPercent,
              noPercent,
              noWithVetoPercent,
              abstainPercent,
            };

            if (pro_turnout >= quorum) {
              if (pro_votes_yes > (pro_total_vote - pro_votes_abstain) / 2) {
                if (pro_votes_no_with_veto < pro_total_vote / 3) {
                  this.finalSubTitle = VOTING_SUBTITLE.PASS;
                } else {
                  this.finalSubTitle = VOTING_SUBTITLE.REJECT_1.toString().replace(
                    '{{proposalDetail.noWithVetoPercent}}',
                    this.numberPipe
                      .transform(this.proposalDetail.veto_threshold, this.global.formatNumber2Decimal)
                      .toString(),
                  );
                }
              } else if (pro_votes_no_with_veto < pro_total_vote / 3) {
                this.finalSubTitle = VOTING_SUBTITLE.REJECT_2;
              } else {
                this.finalSubTitle = VOTING_SUBTITLE.REJECT_1.toString().replace(
                  '{{proposalDetail.noWithVetoPercent}}',
                  this.numberPipe
                    .transform(this.proposalDetail.veto_threshold, this.global.formatNumber2Decimal)
                    .toString(),
                );
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
      .subscribe({
        complete: () => {
          this.votingBarLoading = false;
        },
      });
  }

  makeProposalDataDetail(data) {
    const pro_votes_yes = balanceOf(+data.pro_votes_yes);
    const pro_votes_no = balanceOf(+data.pro_votes_no);
    const pro_votes_no_with_veto = balanceOf(+data.pro_votes_no_with_veto);
    const pro_votes_abstain = balanceOf(+data.pro_votes_abstain);

    const pro_total_vote = pro_votes_yes + pro_votes_no + pro_votes_no_with_veto + pro_votes_abstain;

    return {
      ...data,
      pro_voting_start_time: this.datePipe.transform(data.pro_voting_start_time, DATEFORMAT.DATETIME_UTC),
      pro_voting_end_time: this.datePipe.transform(data.pro_voting_end_time, DATEFORMAT.DATETIME_UTC),
      pro_submit_time: this.datePipe.transform(data.pro_submit_time, DATEFORMAT.DATETIME_UTC),
      pro_deposit_end_time: this.datePipe.transform(data.pro_deposit_end_time, DATEFORMAT.DATETIME_UTC),
      initial_deposit: balanceOf(data.initial_deposit),
      pro_total_deposits: balanceOf(data.pro_total_deposits),
      pro_type: data.pro_type.split('.').pop(),
      pro_votes_yes,
      pro_votes_no,
      pro_votes_no_with_veto,
      pro_votes_abstain,
      pro_total_vote,
      request_amount: balanceOf(data.request_amount),
    };
  }

  parsingProposalStatus(proposalDetail): void {
    const currentTotal =
      proposalDetail.pro_votes_yes + proposalDetail.pro_votes_no + proposalDetail.pro_votes_no_with_veto || 0;
    const currentYesPercent = (proposalDetail.pro_votes_yes * 100) / currentTotal || 0;
    const currentNoPercent = (proposalDetail.pro_votes_no * 100) / currentTotal || 0;
    const currentNoWithVetoPercent = (proposalDetail.pro_votes_no_with_veto * 100) / currentTotal || 0;

    if (proposalDetail.pro_turnout >= proposalDetail.quorum) {
      this.isNotReached = false;
      this.quorumStatus = VOTING_QUORUM.REACHED;

      if (proposalDetail.currentYesPercent > proposalDetail.threshold) {
        if (proposalDetail.noWithVetoPercent < proposalDetail.veto_threshold) {
          // case pass
          this.currentStatus = VOTING_STATUS.PROPOSAL_STATUS_PASSED;
          this.currentSubTitle =
            'This proposal may pass when the voting period is over because current quorum is more than ' +
            this.numberPipe.transform(proposalDetail.quorum, this.global.formatNumber2Decimal).toString() +
            '% and there are more than ' +
            this.numberPipe.transform(proposalDetail.threshold, this.global.formatNumber2Decimal).toString() +
            '% of Yes votes.';
        } else {
          this.currentStatus = VOTING_STATUS.PROPOSAL_STATUS_REJECTED;
          this.currentSubTitle =
            'The proportion of NoWithVeto votes is superior to ' +
            this.numberPipe.transform(proposalDetail.veto_threshold, this.global.formatNumber2Decimal).toString() +
            '%';
        }
      } else {
        this.currentStatus = VOTING_STATUS.PROPOSAL_STATUS_REJECTED;
        this.currentSubTitle =
          'The proportion of Yes votes is inferior to ' +
          this.numberPipe.transform(proposalDetail.threshold, this.global.formatNumber2Decimal).toString() +
          '%';
      }
    } else {
      this.currentStatus = VOTING_STATUS.PROPOSAL_STATUS_REJECTED;
      this.currentSubTitle =
        'Current quorum is less than ' +
        this.numberPipe.transform(proposalDetail.quorum, this.global.formatNumber2Decimal).toString() +
        '% and this proposal requires more participation';
    }
    this.proposalDetail = {
      ...this.proposalDetail,
      currentTotal,
      currentYesPercent,
      currentNoPercent,
      currentNoWithVetoPercent,
    };
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

  getCurrentStatus(key: string) {
    let resObj: { value: string; class: string; key: string } = null;
    const statusObj = this.currentStatusConstant.find((s) => s.key === key);
    if (statusObj !== undefined) {
      resObj = {
        value: statusObj.value,
        class: statusObj.class,
        key: statusObj.key,
      };
      return resObj;
    }
    return (resObj = {
      value: 'reject',
      class: 'text--danger',
      key: VOTING_STATUS.PROPOSAL_STATUS_REJECTED,
    });
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
            voteValue: this.voteConstant?.find((s) => s.key === this.voteValue?.keyVote)?.voteOption || null,
          });
        });
      }
    } else {
      this.getProposalDetail();
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
        this.getProposalTally();
      }
    });
  }

  getVotedProposal() {
    const addr = this.walletService.wallet?.bech32Address || null;
    if (addr) {
      this.proposalService.getVotes(this.proposalId, addr, 10, 0).subscribe((res) => {
        this.proposalVotes = this.voteConstant.find((s) => s.key === res.data?.transactions[0]?.tx?.body?.messages[0]?.option)?.voteOption;
        this.voteValue = {
          keyVote: res.data?.transactions[0]?.tx?.body?.messages[0]?.option,
        };
      });
    } else {
      this.proposalVotes = null;
    }
  }

  calculatePercentVote(data) {
    const pro_votes_yes = balanceOf(+data.tally.yes);
    const pro_votes_no = balanceOf(+data.tally.no);
    const pro_votes_no_with_veto = balanceOf(+data.tally.no_with_veto);
    const pro_votes_abstain = balanceOf(+data.tally.abstain);
    const pro_total_vote = pro_votes_yes + pro_votes_no + pro_votes_no_with_veto + pro_votes_abstain;

    const yesPercent = (pro_votes_yes * 100) / pro_total_vote || 0;
    const noPercent = (pro_votes_no * 100) / pro_total_vote || 0;
    const noWithVetoPercent = (pro_votes_no_with_veto * 100) / pro_total_vote || 0;
    const abstainPercent = (pro_votes_abstain * 100) / this.proposalDetail.total_bonded_token || 0;
    const voted = pro_total_vote - pro_votes_abstain;
    const voted_percent = (voted * 100) / this.proposalDetail.total_bonded_token;

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
    if (!nodeData?.proposalVoteTally?.tally) {
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
      ...this.proposalDetail,
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

  ngAfterViewChecked(): void {
    const editor = document.getElementById('marked');
    if (editor) {
      editor.innerHTML = marked.parse(this.proposalDetail.pro_description);
      return;
    }
  }
}
