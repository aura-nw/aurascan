import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { VOTING_FINAL_STATUS, VOTING_STATUS } from 'src/app/core/constants/proposal.constant';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-current-status',
  templateUrl: './current-status.component.html',
  styleUrls: ['./current-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentStatusComponent implements OnInit {
  @Input() proposalDetail;
  @Input()
  currentSubTitle: string;
  @Input()
  currentStatus: { value: string; class: string; key: string };

  constructor(public global: Globals) {}

  ngOnInit(): void {}

  getCurrentStatus(key: string) {
    let resObj: { value: string; class: string; key: string } = null;
    const statusObj = VOTING_FINAL_STATUS.find((s) => s.key === key);
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
}
