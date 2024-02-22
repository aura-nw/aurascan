import { Component, Inject } from '@angular/core';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import { MsgVote } from 'cosmjs-types/cosmos/gov/v1beta1/tx';
import { TIME_OUT_CALL_API } from 'src/app/core/constants/common.constant';
import { TRANSACTION_TYPE_ENUM } from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { IVotingDialog } from 'src/app/core/models/proposal.model';
import { MappingErrorService } from 'src/app/core/services/mapping-error.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { parseErrorFromMetamask } from 'src/app/core/utils/cosmoskit/helpers/metamask-parser';

@Component({
  selector: 'app-proposal-vote',
  templateUrl: './proposal-vote.component.html',
  styleUrls: ['./proposal-vote.component.scss'],
})
export class ProposalVoteComponent {
  keyVote = null;
  chainId = this.environmentService.chainId;
  chainInfo = this.environmentService.chainInfo;
  isLoading = false;

  chainVoteOption = {
    Yes: 1,
    Abstain: 2,
    No: 3,
    NoWithVeto: 4,
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IVotingDialog,
    public dialogRef: MatDialogRef<ProposalVoteComponent>,
    private environmentService: EnvironmentService,
    private toastr: NgxToastrService,
    private walletService: WalletService,
    private mappingErrorService: MappingErrorService,
  ) {
    this.keyVote = data.voteValue ?? null;
  }

  async vote() {
    const account = this.walletService.getAccount();

    if (!account) {
      return;
    }

    const msg = {
      typeUrl: TRANSACTION_TYPE_ENUM.Vote,
      value: MsgVote.fromPartial({
        voter: account.address,
        proposalId: BigInt(this.data.id),
        option: this.chainVoteOption[this.keyVote],
      }),
    };

    this.isLoading = true;

    const multiplier = 1.7; // multiplier
    const fee = await this.walletService.estimateFee([msg], 'stargate', '', multiplier).catch(() => undefined);

    this.walletService
      .signAndBroadcast(account.address, [msg], fee)
      .then((result) => {
        if (result?.transactionHash) {
          this.toastr.loading(result.transactionHash);

          setTimeout(() => {
            this.mappingErrorService.checkDetailTx(result?.transactionHash);
          }, TIME_OUT_CALL_API);
        }
        this.dialogRef.close();
        this.isLoading = false;
      })
      .catch((error) => {
        this.isLoading = false;
        const { code, message } = parseErrorFromMetamask(error);
        let errorMessage = this.mappingErrorService.checkMappingError(message, code);
        this.toastr.error(errorMessage);
        this.closeVoteForm();
      });
  }

  closeVoteForm() {
    this.dialogRef.close('canceled');
  }
}
