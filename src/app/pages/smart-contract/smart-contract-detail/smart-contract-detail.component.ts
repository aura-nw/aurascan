import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TOKEN_TAB } from '../../../../app/core/constants/smart-contract.constant';
import { TokenTab } from '../../../../app/core/constants/smart-contract.enum';
import { TYPE_TRANSACTION } from '../../../../app/core/constants/transaction.constant';
import { SmartContractService } from '../../../../app/core/services/smart-contract.service';

@Component({
  selector: 'app-smart-contract-detail',
  templateUrl: './smart-contract-detail.component.html',
  styleUrls: ['./smart-contract-detail.component.scss'],
})
export class SmartContractDetailComponent implements OnInit {
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
  tokenDataList: any[];
  token: string = '';
  loading = true;
  typeTransaction = TYPE_TRANSACTION;
  textSearch: string = '';

  constructor(private smartContractService: SmartContractService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.getDataTable();
  }

  getDataTable(): void {
    this.smartContractService.getListTokenTransfer(this.token).subscribe((res) => {
      this.loading = true;
      if (res) {
        this.tokenDataList = [...res];
        console.log(this.tokenDataList);
        
        this.tokenDataList.forEach((token) => {
          // k.timestamp = this.datePipe.transform(k.timestamp, DATEFORMAT.DATETIME_UTC);
          const typeTrans = this.typeTransaction.find((f) => f.label.toLowerCase() === token.type.toLowerCase());
          token.type = typeTrans?.value;
        });
      }
      this.loading = false;
    });
  }

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

  searchTokenTable(): void {
  }
}
