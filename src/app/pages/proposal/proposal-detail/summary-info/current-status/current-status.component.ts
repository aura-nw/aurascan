import { Component, Input } from '@angular/core';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-current-status',
  templateUrl: './current-status.component.html',
  styleUrls: ['./current-status.component.scss'],
})
export class CurrentStatusComponent {
  @Input() proposalDetail;
  @Input() currentSubTitle: string;
  @Input() currentStatus: { value: string; class: string; key: string };
  constructor(public global: Globals) {}
}
