import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MESSAGE_WARNING } from 'src/app/core/constants/proposal.constant';
import { CodeTransaction } from 'src/app/core/constants/transaction.enum';
import {  ESigningType, SIGNING_MESSAGE_TYPES } from 'src/app/core/constants/wallet.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ResponseDto } from 'src/app/core/models/common.model';
import { IVotingDialog } from 'src/app/core/models/proposal.model';
import { MappingErrorService } from 'src/app/core/services/mapping-error.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { createSignBroadcast } from 'src/app/core/utils/signing/transaction-manager';
import {TIME_OUT_CALL_API} from "src/app/core/constants/common.constant";


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
    const { hash, error } = await createSignBroadcast({
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

    if (hash) {
      this.isLoading = false;
      this.dialogRef.close({ keyVote: this.keyVote });
      setTimeout(() => {
        this.checkDetailTx(hash, 'Error Voting');
      }, TIME_OUT_CALL_API);
    } else if (error) {
      this.toastr.error(error);
      this.closeVoteForm();
    }
  }

  checkDetailTx(id, message) {
    this.transactionService.txsDetail(id).subscribe(
      (res: ResponseDto) => {
        let numberCode = res?.data?.code;
        message = res?.data?.raw_log || message;
        message = this.mappingErrorService.checkMappingError(message, numberCode);
        if (numberCode !== undefined) {
          if (numberCode === CodeTransaction.Success) {
            this.toastr.success(message);
          } else {
            this.toastr.error(message);
          }
        }
      },
      (error) => {},
    );
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
