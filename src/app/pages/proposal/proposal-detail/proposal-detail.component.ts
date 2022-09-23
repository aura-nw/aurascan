import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-proposal-detail',
  templateUrl: './proposal-detail.component.html',
  styleUrls: ['./proposal-detail.component.scss'],
})
export class ProposalDetailComponent implements OnInit {
  proposalId: number;
  proposalDetail;

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

  getProposalDetail(e):void{
    this.proposalDetail = e;
  }

  ngOnInit(): void {}
}
