import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { formatNumber } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import * as _ from 'lodash';
import * as moment from 'moment';
import { from, interval } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { NUMBER_2_DIGIT, NUMBER_ONLY_DECIMAL } from 'src/app/core/constants/common.constant';
import { WalletService } from 'src/app/core/services/wallet.service';
import {
  PROPOSAL_STATUS,
  PROPOSAL_VOTE,
  SPECIFIC_TYPE_PROPOSAL,
  VOTING_FINAL_STATUS,
  VOTING_QUORUM,
  VOTING_STATUS,
  VOTING_SUBTITLE,
} from '../../../../core/constants/proposal.constant';
import { EnvironmentService } from '../../../../core/data-services/environment.service';
import { CommonService } from '../../../../core/services/common.service';
import { ProposalService } from '../../../../core/services/proposal.service';
import { balanceOf } from '../../../../core/utils/common/parsing';
import { ProposalVoteComponent } from '../../proposal-vote/proposal-vote.component';
const marked = require('marked');

@Component({
  selector: 'app-summary-info',
  templateUrl: './summary-info.component.html',
  styleUrls: ['./summary-info.component.scss'],
})
export class SummaryInfoComponent implements OnInit {
  @Input() proposalId: number;
  @Output() proposalDtl = new EventEmitter();
  proDetail;
  specialDataArr = [];
  statusConstant = PROPOSAL_STATUS;
  currentStatusConstant = VOTING_FINAL_STATUS;
  voteConstant = PROPOSAL_VOTE;
  voteValue: { keyVote: string } = null;
  chainId = this.environmentService.chainId;
  proposalVotes: string;
  votingBarLoading = false;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  currentStatus: VOTING_STATUS | string = VOTING_STATUS.PROPOSAL_STATUS_REJECTED;
  finalSubMessage: VOTING_SUBTITLE | string = VOTING_SUBTITLE.PASS;
  currentSubMessage = '';
  isNotReached = true;
  quorumStatus = VOTING_QUORUM.NOT_REACHED;
  timerGetUpTime: any;
  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  proStatus = null;
  typeSpecial = {
    SoftwareUpgrade: SPECIFIC_TYPE_PROPOSAL.SOFTWARE_UPGRADE,
    ParameterChange: SPECIFIC_TYPE_PROPOSAL.PARAMETER_CHANGE,
  };
  activeId = 0;
  reload$;
  dataDenomRequest: any;
  numberOnlyDecimal = NUMBER_ONLY_DECIMAL;
  number2Digit = NUMBER_2_DIGIT;

  constructor(
    private proposalService: ProposalService,
    private walletService: WalletService,
    public dialog: MatDialog,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.getProposalDetail();
    this.walletService.walletAccount$.subscribe((wallet) => this.getVotedProposal());
  }

  enabledReload() {
    if (!this.reload$) {
      this.reload$ = interval(10000)
        .pipe()
        .subscribe((r) => {
          this.proposalService.reloadList();
          this.getProposalDetail();
          this.getVotedProposal();
        });
    }
  }

  getProposalDetail(): void {
    let payload = {
      limit: 1,
      proposalId: this.proposalId,
    };

    this.proposalService
      .getProposalData(payload)
      .pipe(
        map((dta) => dta),
        mergeMap((data) => {
          if (data?.proposal?.length > 0) {
            if (data.proposal[0].status === VOTING_STATUS.PROPOSAL_STATUS_NOT_ENOUGH_DEPOSIT) {
              this.proposalDtl.emit(null);
            }
            this.proDetail = this.makeProposalDataDetail(data.proposal[0]);
            this.proStatus = this.getStatus(data.proposal[0].status);

            if (this.proDetail?.content?.amount) {
              this.dataDenomRequest = this.commonService.mappingNameIBC(this.proDetail?.content?.amount[0]?.denom);
              this.proDetail['request_amount'] = balanceOf(
                this.proDetail?.content?.amount[0]?.amount,
                this.dataDenomRequest['decimals'],
              );
            }
            return this.commonService.status().pipe(
              mergeMap((res) => {
                if (res) {
                  this.proDetail.total_bonded_token = balanceOf(res.bonded_tokens);
                  if (data.proposal[0].status === VOTING_STATUS.PROPOSAL_STATUS_VOTING_PERIOD) {
                    this.proDetail.voting_start_time = data.proposal[0].voting_start_time;
                    this.proDetail.voting_end_time = data.proposal[0].voting_end_time;
                    this.proDetail.turnout = (this.proDetail.total_vote * 100) / this.proDetail.total_bonded_token;
                  } else {
                    this.proDetail.turnout = this.proDetail.turnout;
                  }
                }
                return from(this.commonService.getParamTallyingFromLCD());
              }),
            );
          } else {
            throw new Error('');
          }
        }),
        map((paramFromIndexer) => paramFromIndexer?.data?.tally_params),
        map((result) => {
          if (!result) {
            return;
          }
          const { quorum, threshold, veto_threshold } = result;
          if (this.proDetail) {
            const { votes_yes: votes_yes, total_vote, votes_abstain, votes_no_with_veto } = this.proDetail;
            this.proDetail['quorum'] = quorum * 100;
            this.proDetail['threshold'] = threshold * 100;
            this.proDetail['veto_threshold'] = veto_threshold * 100;

            const yesPercent = (this.proDetail.votes_yes * 100) / this.proDetail.total_vote || 0;
            const noPercent = (this.proDetail.votes_no * 100) / this.proDetail.total_vote || 0;
            const noWithVetoPercent = (this.proDetail.votes_no_with_veto * 100) / this.proDetail.total_vote || 0;
            const abstainPercent = (this.proDetail.votes_abstain * 100) / this.proDetail.total_vote || 0;
            const voted = this.proDetail.total_vote - this.proDetail.votes_abstain;
            const voted_percent = (voted * 100) / this.proDetail.total_bonded_token;
            const voted_abstain_percent = (this.proDetail.votes_abstain * 100) / this.proDetail.total_bonded_token;

            this.proDetail = {
              ...this.proDetail,
              yesPercent,
              noPercent,
              noWithVetoPercent,
              abstainPercent,
              voted_percent,
              voted,
              voted_abstain_percent,
            };
            this.parsingProposalStatus(this.proDetail);

            if (this.proDetail.status === VOTING_STATUS.PROPOSAL_STATUS_FAILED) {
              this.finalSubMessage = VOTING_SUBTITLE.FAILED;
            } else if (this.proDetail.turnout >= this.proDetail.quorum) {
              if (votes_yes > (total_vote - votes_abstain) / 2) {
                if (votes_no_with_veto < total_vote / 3) {
                  this.finalSubMessage = VOTING_SUBTITLE.PASS;
                } else {
                  this.finalSubMessage = VOTING_SUBTITLE.REJECT_1.toString().replace(
                    '{{proposalDetail.noWithVetoPercent}}',
                    formatNumber(this.proDetail.veto_threshold, 'en-GB', this.number2Digit).toString(),
                  );
                }
              } else if (votes_no_with_veto < total_vote / 3) {
                this.finalSubMessage = VOTING_SUBTITLE.REJECT_2;
              } else {
                this.finalSubMessage = VOTING_SUBTITLE.REJECT_1.toString().replace(
                  '{{proposalDetail.noWithVetoPercent}}',
                  formatNumber(this.proDetail.veto_threshold, 'en-GB', this.number2Digit).toString(),
                );
              }
            } else {
              this.finalSubMessage = VOTING_SUBTITLE.REJECT_3;
            }
          } else {
            this.proposalDtl.emit(this.proDetail);
          }

          // set interval reload when type = voting period or deposit period
          if (
            this.proDetail.status === VOTING_STATUS.PROPOSAL_STATUS_VOTING_PERIOD ||
            this.proDetail.status === VOTING_STATUS.PROPOSAL_STATUS_DEPOSIT_PERIOD
          ) {
            this.enabledReload();
          }
        }),
      )
      .subscribe({
        complete: () => {
          this.votingBarLoading = false;
          this.proposalDtl.emit(this.proDetail);
        },
        error: (e) => {
          this.proposalDtl.emit(this.proDetail);
        },
      });
  }

  makeProposalDataDetail(data) {
    let votes_yes = balanceOf(+data.tally.yes);
    let votes_no = balanceOf(+data.tally.no);
    let votes_no_with_veto = balanceOf(+(data.tally.no_with_veto || data.tally.noWithVeto));
    let votes_abstain = balanceOf(+data.tally.abstain);
    const total_vote = votes_yes + votes_no + votes_no_with_veto + votes_abstain || 0;
    const dataDetail = this.proDetail || data;
    let type: string;
    let plan: any;
    let changes: any;
    let org_type: any;
    if (data['content'].length > 0) {
      type = data.content[0]['@type']?.split('.').pop();
      if (data.content[0]['@type'] === SPECIFIC_TYPE_PROPOSAL.LEGACY_CONTENT) {
        type = data.content[0]['content']['@type']?.split('.').pop();
        org_type = data.content[0]['content']['@type'];
      } else {
        changes = data.content[0].params;
        plan = data.content[0].plan;
      }

      if (org_type === SPECIFIC_TYPE_PROPOSAL.PARAMETER_CHANGE) {
        changes = data.content[0].content.changes[0];
      } else if (org_type === SPECIFIC_TYPE_PROPOSAL.SOFTWARE_UPGRADE) {
        plan = data.content[0].content.plan;
      }
    } else {
      type = data.content['@type']?.split('.').pop();
      org_type = data.content['@type'];
      if (org_type === SPECIFIC_TYPE_PROPOSAL.SOFTWARE_UPGRADE) {
        plan = data.content.plan;
      } else if (org_type === SPECIFIC_TYPE_PROPOSAL.PARAMETER_CHANGE) {
        changes = data.content.changes[0];
      }
      org_type = data.content['@type'];
    }

    //get more info proposal detail
    if (plan || changes) {
      this.getProposalMoreInfo(plan || changes);
    }

    return {
      ...dataDetail,
      count_vote: data.count_vote || dataDetail.count_vote,
      initial_deposit: balanceOf(_.get(data, 'initial_deposit[0].amount') || 0),
      pro_total_deposits: balanceOf(_.get(data, 'total_deposit[0].amount') || 0),
      type,
      votes_yes,
      votes_no,
      votes_no_with_veto,
      votes_abstain,
      total_vote,
      plan,
      changes,
      org_type,
      request_amount: balanceOf(data.request_amount),
      proposer_name: _.get(data, 'description.moniker'),
    };
  }

  parsingProposalStatus(proDetail): void {
    const currentTotal = proDetail.votes_yes + proDetail.votes_no + proDetail.votes_no_with_veto || 0;
    const currentYesPercent = (proDetail.votes_yes * 100) / currentTotal || 0;
    const currentNoPercent = (proDetail.votes_no * 100) / currentTotal || 0;
    const currentNoWithVetoPercent = (proDetail.votes_no_with_veto * 100) / currentTotal || 0;

    if (proDetail.turnout >= proDetail.quorum) {
      this.isNotReached = false;
      this.quorumStatus = VOTING_QUORUM.REACHED;

      if ((currentYesPercent || proDetail.currentYesPercent) > proDetail.threshold) {
        if (proDetail.noWithVetoPercent < proDetail.veto_threshold) {
          // case pass
          this.currentStatus = VOTING_STATUS.PROPOSAL_STATUS_PASSED;
          this.currentSubMessage =
            'This proposal may pass when the voting period is over because current quorum is more than ' +
            formatNumber(proDetail.quorum, 'en-GB', this.number2Digit)?.toString() +
            '% and there are more than ' +
            formatNumber(proDetail.threshold, 'en-GB', this.number2Digit)?.toString() +
            '% of Yes votes.';
        } else {
          this.currentStatus = VOTING_STATUS.PROPOSAL_STATUS_REJECTED;
          this.currentSubMessage =
            'The proportion of NoWithVeto votes is superior to ' +
            formatNumber(proDetail.veto_threshold, 'en-GB', this.number2Digit)?.toString() +
            '%';
        }
      } else {
        this.currentStatus = VOTING_STATUS.PROPOSAL_STATUS_REJECTED;
        this.currentSubMessage =
          'The proportion of Yes votes is inferior to ' +
          formatNumber(this.proDetail.threshold, 'en-GB', this.number2Digit)?.toString() +
          '%';
      }
    } else {
      this.isNotReached = true;
      this.quorumStatus = VOTING_QUORUM.NOT_REACHED;
      this.currentStatus = VOTING_STATUS.PROPOSAL_STATUS_REJECTED;
      this.currentSubMessage =
        'Current quorum is less than ' +
        formatNumber(this.proDetail.quorum, 'en-GB', this.number2Digit)?.toString() +
        '% and this proposal requires more participation';
    }
    this.proDetail = {
      ...this.proDetail,
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

  openVoteDialog(proDetail) {
    const id = proDetail.proposal_id;
    const title = proDetail['title'] ? proDetail['title'] : proDetail.content.title;
    const expiredTime = +moment(proDetail.voting_end_time).format('x') - +moment().format('x');

    if (expiredTime > 0) {
      const account = this.walletService.walletAccount;
      if (account) {
        this.openDialog({
          id,
          title,
          voteValue: this.voteConstant?.find((s) => s.key === this.voteValue?.keyVote)?.voteOption || null,
        });
      }
    } else {
      this.getProposalDetail();
    }
  }

  openDialog(data): void {
    this.dialog.open(ProposalVoteComponent, {
      width: '431px',
      data: data,
    });
  }

  getVotedProposal() {
    const addr = this.walletService.walletAccount?.address || null;
    if (addr) {
      const payload = {
        proposal_id: this.proposalId?.toString(),
        address: addr,
      };
      this.proposalService.getVotedResult(payload).subscribe((res) => {
        const optionVote = this.proposalService.getVoteMessageByConstant(res?.vote[0]?.vote_option);
        this.proposalVotes = this.voteConstant?.find((s) => s.key === optionVote)?.voteOption;
        this.voteValue = {
          keyVote: optionVote,
        };
      });
    } else {
      this.proposalVotes = null;
    }
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
      numberVote = formatNumber(abs, 'en-GB', this.numberOnlyDecimal);
      return (isNegative ? '-' : '') + numberVote + key;
    }
    return (isNegative ? '-' : '') + abs + key;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const editor = document.getElementById('marked');
      if (editor) {
        editor.innerHTML = marked.parse(this.proDetail?.description);
        return;
      }
    }, 2000);
  }

  getProposalMoreInfo(data: any) {
    if (this.specialDataArr?.length === 0) {
      let index = 0;
      data = data[0] || data;
      for (let prop in data) {
        if (data.hasOwnProperty(prop)) {
          this.specialDataArr.push({
            key: index,
            value: prop,
          });
          index++;
        }
      }
    }
  }

  changeTab(key) {
    this.activeId = key;
  }

  typeOf(value) {
    return typeof value;
  }

  getObjectKey(object) {
    return Object.keys(object);
  }
}
