import { Component, Input, OnInit } from '@angular/core';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-current-status',
  templateUrl: './current-status.component.html',
  styleUrls: ['./current-status.component.scss'],
})
export class CurrentStatusComponent implements OnInit {
  @Input() proposalDetail;
  @Input()
  currentSubTitle: string;
  @Input()
  currentStatus: { value: string; class: string; key: string };
  currentTotal = 0;
  currentYesPercent = 0;
  currentNoPercent = 0;
  currentNoWithVetoPercent = 0;

  constructor(public global: Globals) {}

  ngOnInit(): void {
    this.currentTotal = this.proposalDetail.pro_votes_yes + this.proposalDetail.pro_votes_no + this.proposalDetail.pro_votes_no_with_veto;
    this.currentYesPercent = this.proposalDetail.pro_votes_yes * 100 / this.currentTotal || 0;
    this.currentNoPercent = this.proposalDetail.pro_votes_no * 100 / this.currentTotal || 0;
    this.currentNoWithVetoPercent = this.proposalDetail.pro_votes_no_with_veto * 100 / this.currentTotal || 0;
  }
}
