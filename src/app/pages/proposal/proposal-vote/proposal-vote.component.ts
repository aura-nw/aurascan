import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MESSAGE_WARNING } from '../../../core/constants/proposal.constant';
import { ChainsInfo, SIGNING_MESSAGE_TYPES } from '../../../core/constants/wallet.constant';
import { EnvironmentService } from '../../../core/data-services/environment.service';
import { IVotingDialog } from '../../../core/models/proposal.model';
import { NgxToastrService } from '../../../core/services/ngx-toastr.service';
import { WalletService } from '../../../core/services/wallet.service';
import { createSignBroadcast } from '../../../core/utils/signing/transaction-manager';

@Component({
  selector: 'app-proposal-vote',
  templateUrl: './proposal-vote.component.html',
  styleUrls: ['./proposal-vote.component.scss'],
})
export class ProposalVoteComponent implements OnInit {
  keyVote = null;
  chainId = this.environmentService.apiUrl.value.chainId;

  MESSAGE = MESSAGE_WARNING;

  constructor(
    public dialogRef: MatDialogRef<ProposalVoteComponent>,
    private environmentService: EnvironmentService,
    private toastr: NgxToastrService,
    private walletService: WalletService,
    @Inject(MAT_DIALOG_DATA) public data: IVotingDialog,
    private route: Router,
  ) {
    this.keyVote = data.voteValue ?? null;
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

    if (hash) {
      this.dialogRef.close({ keyVote: this.keyVote });
    }

    if (error) {
      this.toastr.error(error);
      this.closeVoteForm();
    }
  }

  onSubmitVoteForm() {
    this.proposalVote();
  }

  closeVoteForm() {
    this.dialogRef.close();
  }
  onClick(): void {
    if (this.data.warning === MESSAGE_WARNING.LATE) {
      this.dialogRef.close();
    } else {
      this.route.navigate(['validators']);
      this.dialogRef.close();
    }
  }
}
