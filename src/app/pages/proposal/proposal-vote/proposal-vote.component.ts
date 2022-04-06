import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChainsInfo, SIGNING_MESSAGE_TYPES } from '../../../core/constants/wallet.constant';
import { EnvironmentService } from '../../../core/data-services/environment.service';
import { NgxToastrService } from '../../../core/services/ngx-toastr.service';
import { createSignBroadcast, createSignBroadcastForVote } from '../../../core/utils/signing/transaction-manager';

@Component({
  selector: 'app-proposal-vote',
  templateUrl: './proposal-vote.component.html',
  styleUrls: ['./proposal-vote.component.scss'],
})
export class ProposalVoteComponent implements OnInit {
  keyVote: number = null;
  chainId = this.environmentService.apiUrl.value.chainId;
  constructor(
    public dialogRef: MatDialogRef<ProposalVoteComponent>,
    private environmentService: EnvironmentService,
    private toastr: NgxToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.keyVote = data.voteValue?.keyVote ?? null;
  }

  ngOnInit(): void {}

  async clampReward() {
    const { hash, error } = await createSignBroadcastForVote({
      messageType: SIGNING_MESSAGE_TYPES.VOTE,
      message: {
        voteOption: 'Yes',
          proposalId: 4,
      },
      senderAddress: 'aura1q3truhus7zwhazzuaczygc5fy3u4a2frknavq2',
      network: ChainsInfo[this.chainId],
      signingType: 'keplr',
      chainId: this.chainId,
    });

    if (error) {
      console.log(error);
      
      // this.toastr.error(error);
    }
  }

  onSubmitVoteForm() {
    this.clampReward();
    this.dialogRef.close({ keyVote: this.keyVote });
  }
}
