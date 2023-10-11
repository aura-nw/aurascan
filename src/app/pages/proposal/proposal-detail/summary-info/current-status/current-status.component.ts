import { Component, Input } from '@angular/core';
import { NUMBER_2_DIGIT } from 'src/app/core/constants/common.constant';

@Component({
  selector: 'app-current-status',
  templateUrl: './current-status.component.html',
  styleUrls: ['./current-status.component.scss'],
})
export class CurrentStatusComponent {
  @Input() proposalDetail;
  @Input() currentSubTitle: string;
  @Input() currentStatus: { value: string; class: string; key: string };

  number2Digit = NUMBER_2_DIGIT;

  constructor() {}
}
