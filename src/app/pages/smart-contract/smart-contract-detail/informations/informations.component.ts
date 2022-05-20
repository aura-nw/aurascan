import { Component, OnInit } from '@angular/core';
import {TOKEN_TAB} from "../../../../core/constants/smart-contract.constant";
import {TokenTab} from "../../../../core/constants/smart-contract.enum";

@Component({
  selector: 'app-informations',
  templateUrl: './informations.component.html',
  styleUrls: ['./informations.component.scss']
})
export class InformationsComponent implements OnInit {
  TABS = TOKEN_TAB.filter((vote) =>
      [
        TokenTab.Transfers,
        TokenTab.Holders,
        // TokenTab.Info,
        TokenTab.Contract,
        // TokenTab.Analytics
      ]
          .includes(vote.key),
  ).map((vote) => ({
    ...vote,
    value: vote.value.toUpperCase(),
    key: vote.key === TokenTab.Transfers ? '' : vote.key,
  }));

  countCurrent: string = '';
  textSearch: string = '';

  constructor() { }

  ngOnInit(): void {}

  changeTab(tabId): void {
    this.countCurrent = tabId;
    switch (tabId) {
      case '':
        // this.voteDataList = this.voteData.all.proposalVotes;
        break;
      case TokenTab.Holders:
        // this.voteDataList = this.voteData.yes.proposalVotes;
        break;
      case TokenTab.Info:
        // this.voteDataList = this.voteData.abstain.proposalVotes;
        break;
      case TokenTab.Contract:
        // this.voteDataList = this.voteData.abstain.proposalVotes;
        break;
      case TokenTab.Analytics:
        // this.voteDataList = this.voteData.abstain.proposalVotes;
        break;
    }
  }

}
