import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChainsInfo, SIGNING_MESSAGE_TYPES } from '../../../core/constants/wallet.constant';
import { EnvironmentService } from '../../../core/data-services/environment.service';
import { NgxToastrService } from '../../../core/services/ngx-toastr.service';
import { WalletService } from '../../../core/services/wallet.service';
import { createSignBroadcast } from '../../../core/utils/signing/transaction-manager';

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
    private walletService: WalletService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.keyVote = data.voteValue?.keyVote ?? null;
  }

  ngOnInit(): void {}

  async proposalVote() {
    const { hash, error } = await createSignBroadcast({
      messageType: SIGNING_MESSAGE_TYPES.VOTE,
      message: {
        voteOption: this.keyVote,
        proposalId: this.data.id + '',
      },
      senderAddress: this.walletService.wallet.bech32Address,
      network: ChainsInfo[this.chainId],
      signingType: 'keplr',
      chainId: this.chainId,
    });

    // if(hash)
    // {
    //   this.toastr.success(hash);
    // }

    if (error) {
      this.toastr.error(error);
    }
  }

  onSubmitVoteForm() {
    this.proposalVote();
    this.dialogRef.close({ keyVote: this.keyVote });
  }

  closeVoteForm() {
    this.dialogRef.close();
  }
}
