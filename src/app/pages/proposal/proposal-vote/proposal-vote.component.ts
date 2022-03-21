import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-proposal-vote',
  templateUrl: './proposal-vote.component.html',
  styleUrls: ['./proposal-vote.component.scss']
})
export class ProposalVoteComponent implements OnInit {
  keyVote: number = null;

  constructor(
      public dialogRef: MatDialogRef<ProposalVoteComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.keyVote = data.voteValue?.keyVote ?? null;
  }

  ngOnInit(): void {}

  onSubmitVoteForm() {
    this.dialogRef.close({keyVote: this.keyVote});
  }
}
