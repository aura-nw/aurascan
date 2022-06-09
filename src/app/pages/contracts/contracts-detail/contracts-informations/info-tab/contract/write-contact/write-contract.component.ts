import { Component, Input, OnInit } from '@angular/core';
import { GAS_ESTIMATE, STABLE_UTOKEN } from 'src/app/core/constants/common.constant';
import { WalletService } from 'src/app/core/services/wallet.service';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ChainsInfo } from 'src/app/core/constants/wallet.constant';
import { TranslateService } from '@ngx-translate/core';
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
    public translate: TranslateService,
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

  async excuteSmartContract(name: string) {
    let singer = window.getOfflineSignerOnlyAmino(this.walletService.chainId);
    const client = await SigningCosmWasmClient.connectWithSigner(ChainsInfo[this.walletService.chainId].rpc, singer);

    const contractTemp = this.jsonWriteContract.oneOf.find((contract) => contract.required[0] === name);
    if (contractTemp) {
      let objWriteContract = {};
      contractTemp.properties[name].required.forEach((contract) => {
        // console.log(contract);
        // console.log(contractTemp.properties[name].properties[contract]);
        let type = contractTemp.properties[name].properties[contract].type;
        let element: HTMLInputElement = document.getElementsByClassName('form-check-input ' + name)[
          contract
        ] as HTMLInputElement;
        objWriteContract[contract] = element.value;
        if (type !== 'string') {
          objWriteContract[contract] = Number(element.value);
        }
      });
      // console.log(objWriteContract);
      const msg = {
        [name]: objWriteContract,
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

      try {
        let result = await client.execute(
          this.userAddress,
          this.contractDetailData.contract_address,
          msg,
          fee,
        );
        this.toastr.success(this.translate.instant('NOTICE.SUCCESS_TRANSACTION'));
      } catch (error) {
        if (!error.toString().includes('Request rejected')) {
          let msgError = error.toString() || 'Error';
          this.toastr.error(msgError);
        }
      }
    }
  }
}
