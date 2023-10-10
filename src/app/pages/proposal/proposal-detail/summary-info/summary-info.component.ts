import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import * as _ from 'lodash';
import * as moment from 'moment';
import { from, interval } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { Globals } from '../../../../../app/global/global';
import {
  PROPOSAL_STATUS,
  PROPOSAL_VOTE,
  VOTING_FINAL_STATUS,
  VOTING_QUORUM,
  VOTING_STATUS,
  VOTING_SUBTITLE,
} from '../../../../core/constants/proposal.constant';
import { EnvironmentService } from '../../../../core/data-services/environment.service';
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
export class SummaryInfoComponent implements OnInit {
  @Input() proposalId: number;
  @Output() proposalDtl = new EventEmitter();
  proposalDetail;
  proposalDetailTitleArr = [];
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
  timerGetUpTime: any;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  proposalStatus = null;
  typeSpecial = {
    SoftwareUpgrade: '/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal',
    ParameterChange: '/cosmos.params.v1beta1.ParameterChangeProposal',
  };
  activeId = 0;
  reload$;
  dataDenomRequest: any;

  constructor(
    private proposalService: ProposalService,
    public global: Globals,
    private walletService: WalletService,
    public dialog: MatDialog,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
    public commonService: CommonService,
    private numberPipe: DecimalPipe,
    private transactionService: TransactionService,
  ) {}

  ngOnInit(): void {
    this.getProposalDetail();
    this.walletService.wallet$.subscribe((wallet) => this.getVotedProposal());
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
            this.proposalDetail = this.makeProposalDataDetail(data.proposal[0]);
            this.proposalStatus = this.getStatus(data.proposal[0].status);

            //get more info proposal detail
            if (this.proposalDetail?.content?.plan || this.proposalDetail?.content?.changes) {
              this.getProposalMoreInfo(this.proposalDetail?.content?.plan || this.proposalDetail?.content?.changes);
            }

            if (this.proposalDetail?.content?.amount) {
              this.dataDenomRequest = this.commonService.mappingNameIBC(this.proposalDetail?.content?.amount[0]?.denom);
              this.proposalDetail['request_amount'] = balanceOf(
                this.proposalDetail?.content?.amount[0]?.amount,
                this.dataDenomRequest['decimals'],
              );
            }
            return this.commonService.status().pipe(
              mergeMap((res) => {
                if (res) {
                  this.proposalDetail.total_bonded_token = balanceOf(res.bonded_tokens);
                  if (data.proposal[0].status === VOTING_STATUS.PROPOSAL_STATUS_VOTING_PERIOD) {
                    this.proposalDetail.voting_start_time = data.proposal[0].voting_start_time;
                    this.proposalDetail.voting_end_time = data.proposal[0].voting_end_time;
                    this.proposalDetail.pro_turnout =
                      (this.proposalDetail.pro_total_vote * 100) / this.proposalDetail.total_bonded_token;
                  } else {
                    this.proposalDetail.pro_turnout = this.proposalDetail.turnout;
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
          if (this.proposalDetail) {
            const { pro_votes_yes, pro_total_vote, pro_votes_abstain, pro_votes_no_with_veto } = this.proposalDetail;
            this.proposalDetail['quorum'] = quorum * 100;
            this.proposalDetail['threshold'] = threshold * 100;
            this.proposalDetail['veto_threshold'] = veto_threshold * 100;

            const yesPercent = (this.proposalDetail.pro_votes_yes * 100) / this.proposalDetail.pro_total_vote || 0;
            const noPercent = (this.proposalDetail.pro_votes_no * 100) / this.proposalDetail.pro_total_vote || 0;
            const noWithVetoPercent =
              (this.proposalDetail.pro_votes_no_with_veto * 100) / this.proposalDetail.pro_total_vote || 0;
            const abstainPercent =
              (this.proposalDetail.pro_votes_abstain * 100) / this.proposalDetail.pro_total_vote || 0;
            const voted = this.proposalDetail.pro_total_vote - this.proposalDetail.pro_votes_abstain;
            const voted_percent = (voted * 100) / this.proposalDetail.total_bonded_token;
            const voted_abstain_percent =
              (this.proposalDetail.pro_votes_abstain * 100) / this.proposalDetail.total_bonded_token;

            this.proposalDetail = {
              ...this.proposalDetail,
              yesPercent,
              noPercent,
              noWithVetoPercent,
              abstainPercent,
              voted_percent,
              voted,
              voted_abstain_percent,
            };
            this.parsingProposalStatus(this.proposalDetail);

            if (this.proposalDetail.status === VOTING_STATUS.PROPOSAL_STATUS_FAILED) {
              this.finalSubTitle = VOTING_SUBTITLE.FAILED;
            } else if (this.proposalDetail.pro_turnout >= this.proposalDetail.quorum) {
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
          } else {
            this.proposalDtl.emit(this.proposalDetail);
          }

          // set interval reload when type = voting period or deposit period
          if (
            this.proposalDetail.status === VOTING_STATUS.PROPOSAL_STATUS_VOTING_PERIOD ||
            this.proposalDetail.status === VOTING_STATUS.PROPOSAL_STATUS_DEPOSIT_PERIOD
          ) {
            this.enabledReload();
          }
        }),
      )
      .subscribe({
        complete: () => {
          this.votingBarLoading = false;
          this.proposalDtl.emit(this.proposalDetail);
        },
        error: (e) => {
          this.proposalDtl.emit(this.proposalDetail);
        },
      });
  }

  makeProposalDataDetail(data) {
    let pro_votes_yes = balanceOf(+data.tally.yes);
    let pro_votes_no = balanceOf(+data.tally.no);
    let pro_votes_no_with_veto = balanceOf(+(data.tally.no_with_veto || data.tally.noWithVeto));
    let pro_votes_abstain = balanceOf(+data.tally.abstain);
    const pro_total_vote = pro_votes_yes + pro_votes_no + pro_votes_no_with_veto + pro_votes_abstain;
    const dataDetail = this.proposalDetail || data;
    return {
      ...dataDetail,
      count_vote: data.count_vote || dataDetail.count_vote,
      initial_deposit: balanceOf(_.get(data, 'initial_deposit[0].amount') || 0),
      pro_total_deposits: balanceOf(_.get(data, 'total_deposit[0].amount') || 0),
      pro_type: data?.content['@type']?.split('.').pop(),
      pro_votes_yes,
      pro_votes_no,
      pro_votes_no_with_veto,
      pro_votes_abstain,
      pro_total_vote,
      request_amount: balanceOf(data.request_amount),
      proposer_name: _.get(data, 'description.moniker'),
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

      if ((currentYesPercent || proposalDetail.currentYesPercent) > proposalDetail.threshold) {
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
      this.isNotReached = true;
      this.quorumStatus = VOTING_QUORUM.NOT_REACHED;
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
    const id = proposalDetail.proposal_id;
    const title = proposalDetail.content.title;
    const expiredTime = +moment(proposalDetail.voting_end_time).format('x') - +moment().format('x');

    if (expiredTime > 0) {
      const account = this.walletService.getAccount();
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
    let dialogRef = this.dialog.open(ProposalVoteComponent, {
      width: '431px',
      data: data,
    });
  }

  getVotedProposal() {
    const addr = this.walletService.wallet?.bech32Address || null;
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
      numberVote = this.numberPipe.transform(abs, this.global.formatNumberOnlyDecimal);
      return (isNegative ? '-' : '') + numberVote + key;
    }
    return (isNegative ? '-' : '') + abs + key;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const editor = document.getElementById('marked');
      if (editor) {
        editor.innerHTML = marked.parse(this.proposalDetail.content.description);
        return;
      }
    }, 1000);
  }

  getProposalMoreInfo(data: any) {
    if (this.proposalDetailTitleArr?.length === 0) {
      if (typeof data !== 'object') {
        let index = 0;
        for (let prop in data[0]) {
          this.proposalDetailTitleArr.push({
            key: index,
            value: prop,
          });
          index++;
        }
      }
      if (typeof data === 'object') {
        let index = 0;
        data = data[0] || data;
        for (let prop in data) {
          if (data.hasOwnProperty(prop)) {
            this.proposalDetailTitleArr.push({
              key: index,
              value: prop,
            });
            index++;
          }
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
