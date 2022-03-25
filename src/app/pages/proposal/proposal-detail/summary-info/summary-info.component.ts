import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-summary-info',
  templateUrl: './summary-info.component.html',
  styleUrls: ['./summary-info.component.scss']
})
export class SummaryInfoComponent implements OnInit {
  @Input() proposalId: number;

  constructor() { }

  ngOnInit(): void {
  }

}
