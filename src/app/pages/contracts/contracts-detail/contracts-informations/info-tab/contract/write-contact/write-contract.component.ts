import { Component, Input, OnInit } from '@angular/core';
import { GAS_ESTIMATE, STABLE_UTOKEN } from 'src/app/core/constants/common.constant';
import { ContractService } from 'src/app/core/services/contract.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { SigningCosmWasmClient } from 'cosmwasm';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ResponseDto } from 'src/app/core/models/common.model';
import { CodeTransaction } from 'src/app/core/constants/transaction.enum';
import { ChainsInfo } from 'src/app/core/constants/wallet.constant';
@Component({
  selector: 'app-write-contract',
  templateUrl: './write-contract.component.html',
  styleUrls: ['./write-contract.component.scss'],
})
export class WriteContractComponent implements OnInit {
  @Input() contractDetailData: any;

  isExpand = false;
  isConnectedWallet = false;
  walletAddress = '';
  jsonWriteContract: any;
  userAddress = '';

  constructor(
    public walletService: WalletService,
    private transactionService: TransactionService,
    private toastr: NgxToastrService,
  ) {}

  ngOnInit(): void {
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.userAddress = wallet.bech32Address;
      } else {
        this.userAddress = null;
      }
    });

    this.jsonWriteContract = JSON.parse(this.contractDetailData?.execute_msg_schema);
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.isConnectedWallet = true;
        this.walletAddress = this.walletService.wallet?.bech32Address;
      } else {
        this.isConnectedWallet = false;
      }
    });
  }

  expandMenu(closeAll = false): void {
    for (let i = 0; i < document.getElementsByClassName('content-contract').length; i++) {
      let element: HTMLElement = document.getElementsByClassName('content-contract')[i] as HTMLElement;
      let expand = element.getAttribute('aria-expanded');
      if (closeAll) {
        if (expand == 'true') {
          element.click();
        }
      } else {
        if (expand === this.isExpand.toString()) {
          element.click();
        }
      }
    }
    if (!closeAll) {
      this.isExpand = !this.isExpand;
    }
  }

  reloadData() {
    for (let i = 0; i < document.getElementsByClassName('form-check-input').length; i++) {
      (<HTMLInputElement>document.getElementsByClassName('form-check-input')[i]).value = '';
    }
    this.expandMenu(true);
  }

  connectWallet(): void {
    const account = this.walletService.getAccount();
  }

  async excuteSmartContract() {
    let singer = window.getOfflineSignerOnlyAmino(this.walletService.chainId);
    const client = await SigningCosmWasmClient.connectWithSigner(ChainsInfo[this.walletService.chainId].rpc, singer);
    const msg = {
      add_new: {
        id: 'f1',
        name: 'violet',
        amount: 150,
        price: 100,
      },
    };

    const fee: any = {
      amount: [
        {
          denom: STABLE_UTOKEN,
          amount: '1',
        },
      ],
      gas: GAS_ESTIMATE,
    };

    let result;
    try {
      result = await client.execute(
        // 'aura1trqfuz89vxe745lmn2yfedt7d4xnpcpvltc86e',
        this.userAddress,
        // 'aura18s3u7wvpwhavuukdp0x5jrh028ua4vjjtls4hvgkvgy6lvpkprfsmg5tjt',
        this.contractDetailData.contract_address,
        msg,
        fee,
      );
      this.checkStatuExcuteBlock(result.transactionHash, result.logs, '');
    } catch (error) {
      if (!error.toString().includes('Request rejected')) {
        let msgError = error.toString() || 'Error';
        this.toastr.error(msgError);
      }
    }
    return {
      hash: result.transactionHash || null,
      error: result.logs,
    };
  }

  checkStatuExcuteBlock(hash, error, msg) {
    if (error) {
      if (error != 'Request rejected') {
        this.toastr.error(error);
      }
    } else {
      setTimeout(() => {
        this.checkDetailTx(hash, msg);
      }, 4000);
    }
  }

  checkDetailTx(id, message) {
    this.transactionService.txsDetail(id).subscribe(
      (res: ResponseDto) => {
        let numberCode = res?.data?.code;
        message = res?.data?.raw_log || message;
        // message = this.mappingErrorService.checkMappingError(message, numberCode);
        if (numberCode !== undefined) {
          if (!!!numberCode && numberCode === CodeTransaction.Success) {
            this.toastr.success(message);
          } else {
            this.toastr.error(message);
          }
        }
      },
      (error) => {},
    );
  }
}
