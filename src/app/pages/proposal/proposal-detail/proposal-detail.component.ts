import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-proposal-detail',
  templateUrl: './proposal-detail.component.html',
  styleUrls: ['./proposal-detail.component.scss']
})
export class ProposalDetailComponent implements OnInit {
  // bread crumb items
  breadCrumbItems!: Array<{}>;

  constructor() { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Proposal' },
      { label: 'List'},
      { label: 'Activate governance discussions on the ...', active: true }
    ];
  }

}
