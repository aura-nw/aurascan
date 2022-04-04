import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';

@Component({
  selector: 'app-proposal-detail',
  templateUrl: './proposal-detail.component.html',
  styleUrls: ['./proposal-detail.component.scss'],
})
export class ProposalDetailComponent implements OnInit {
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  proposalId: number;

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {
    activatedRoute.url.subscribe((e) => {
      const proposalId = Number(e[0].path);
      router.url;
      if (proposalId) {
        this.proposalId = proposalId;
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Proposal' },
      { label: 'List' },
      { label: 'Activate governance discussions on the ...', active: true },
    ];
  }
}
