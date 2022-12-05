import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TIME_OUT_CALL_API } from 'src/app/core/constants/common.constant';
import { CodeTransaction } from 'src/app/core/constants/transaction.enum';
import { ESigningType, SIGNING_MESSAGE_TYPES } from 'src/app/core/constants/wallet.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { IVotingDialog } from 'src/app/core/models/proposal.model';
import { MappingErrorService } from 'src/app/core/services/mapping-error.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { WalletService } from 'src/app/core/services/wallet.service';

@Component({
  selector: 'app-proposal-vote',
  templateUrl: './proposal-vote.component.html',
  styleUrls: ['./proposal-vote.component.scss'],
})
export class ProposalVoteComponent implements OnInit {
  keyVote = null;
  chainId = this.environmentService.configValue.chainId;
  chainInfo = this.environmentService.configValue.chain_info;
  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IVotingDialog,
    public dialogRef: MatDialogRef<ProposalVoteComponent>,
    private environmentService: EnvironmentService,
    private toastr: NgxToastrService,
    private walletService: WalletService,
    private route: Router,
    private transactionService: TransactionService,
    private mappingErrorService: MappingErrorService,
  ) {
    this.keyVote = data.voteValue ?? null;
  }

  ngOnInit(): void {}

  async proposalVote() {
    this.isLoading = true;
    const { hash, error } = await this.walletService.signAndBroadcast({
      messageType: SIGNING_MESSAGE_TYPES.VOTE,
      message: {
        voteOption: this.keyVote,
        proposalId: this.data.id + '',
      },
      senderAddress: this.walletService.wallet.bech32Address,
      network: this.chainInfo,
      signingType: ESigningType.Keplr,
      chainId: this.chainId,
    });

    this.isLoading = false;

    if (hash) {
      this.toastr.loading(hash);
      this.dialogRef.close();
      setTimeout(() => {
        this.checkDetailTx(hash, 'Error Voting');
      }, TIME_OUT_CALL_API);
    } else if (error) {
      this.toastr.error(error);
      this.closeVoteForm();
    }
  }

  async checkDetailTx(id, message) {
    const res = await this.transactionService.txsDetailLcd(id);
    let numberCode = res?.data?.tx_response?.code;
    message = res?.data?.tx_response?.raw_log || message;
    message = this.mappingErrorService.checkMappingError(message, numberCode, true);
    if (numberCode !== undefined) {
      if (numberCode === CodeTransaction.Success) {
        this.toastr.success(message);
      } else {
        this.toastr.error(message);
      }
    }
  }

  onSubmitVoteForm() {
    this.proposalVote();
  }

  closeVoteForm() {
    this.dialogRef.close('canceled');
  }
}
