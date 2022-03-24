import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-votes',
  templateUrl: './votes.component.html',
  styleUrls: ['./votes.component.scss'],
})
export class VotesComponent implements OnInit {
  // TABS = ['ALL', 'YES', 'NO', 'NO WITH VETO', 'ABSTAIN', 'DID NOT VOTE']
  TABS = ['ALL', 'YES', 'NO', 'NO WITH VETO', 'ABSTAIN',]

  constructor() {}

  ngOnInit(): void {}

  changeTab(tabId): void {
    console.log(tabId)
  }
}
