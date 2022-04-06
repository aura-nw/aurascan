import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DATEFORMAT } from '../../../../core/constants/common.constant';
import { PROPOSAL_STATUS } from '../../../../core/constants/status.constant';
import { ResponseDto } from '../../../../core/models/common.model';
import { ProposalService } from '../../../../core/services/proposal.service';

@Component({
  selector: 'app-summary-info',
  templateUrl: './summary-info.component.html',
  styleUrls: ['./summary-info.component.scss'],
})
export class SummaryInfoComponent implements OnInit {
  @Input() proposalId: number;
  proposalDetail;
  statusConstant = PROPOSAL_STATUS;
  constructor(private proposalService: ProposalService, private datePipe: DatePipe) {}

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

      this.proposalDetail.pro_total_vote =
        +this.proposalDetail.pro_votes_yes +
        +this.proposalDetail.pro_votes_no +
        +this.proposalDetail.pro_votes_no_with_veto +
        +this.proposalDetail.pro_votes_abstain;

      this.proposalDetail.pro_vote_yes_bar = (+this.proposalDetail.pro_votes_yes * 100) / +this.proposalDetail.pro_total_vote;
      this.proposalDetail.pro_vote_no_bar = (+this.proposalDetail.pro_votes_no * 100) / +this.proposalDetail.pro_total_vote;
      this.proposalDetail.pro_vote_no_with_veto_bar = (+this.proposalDetail.pro_votes_no_with_veto * 100) / +this.proposalDetail.pro_total_vote;
      this.proposalDetail.pro_vote_abstain_bar = (+this.proposalDetail.pro_votes_abstain * 100) / +this.proposalDetail.pro_total_vote;

      this.proposalDetail.yesPercent = this.proposalDetail.pro_total_vote
        ? ((+this.proposalDetail.pro_votes_yes * 100) / +this.proposalDetail.pro_total_vote).toString().split('.')
        : ['0', '00'];
      this.proposalDetail.noPercent = this.proposalDetail.pro_total_vote
        ? ((+this.proposalDetail.pro_votes_no * 100) / +this.proposalDetail.pro_total_vote).toString().split('.')
        : ['0', '00'];
      this.proposalDetail.noWithVetoPercent = this.proposalDetail.pro_total_vote
        ? ((+this.proposalDetail.pro_votes_no_with_veto * 100) / +this.proposalDetail.pro_total_vote)
            .toString()
            .split('.')
        : ['0', '00'];
      this.proposalDetail.abstainPercent = this.proposalDetail.pro_total_vote
        ? ((+this.proposalDetail.pro_votes_abstain * 100) / +this.proposalDetail.pro_total_vote).toString().split('.')
        : ['0', '00'];

      this.proposalDetail.pro_vote_yes = this.proposalDetail.pro_vote_yes
        ? this.proposalDetail.pro_votes_yes?.toString().split('.')
        : ['0', '00'];
      this.proposalDetail.pro_vote_no = this.proposalDetail.pro_vote_no
        ? this.proposalDetail.pro_votes_no?.toString().split('.')
        : ['0', '00'];
      this.proposalDetail.pro_vote_no_with_veto = this.proposalDetail.pro_vote_no_with_veto
        ? this.proposalDetail.pro_votes_no_with_veto?.toString().split('.')
        : ['0', '00'];
      this.proposalDetail.pro_vote_abstain = this.proposalDetail.pro_vote_abstain
        ? this.proposalDetail.pro_votes_abstain?.toString().split('.')
        : ['0', '00'];
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
}
