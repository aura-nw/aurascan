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

  constructor(public global: Globals) {}

  ngOnInit(): void {
    console.log(this.currentStatus);
    console.log(this.proposalDetail.yesPercent);
    console.log(this.proposalDetail.noPercent);
    console.log(this.proposalDetail.noWithVetoPercent);
    
    
  }
}
