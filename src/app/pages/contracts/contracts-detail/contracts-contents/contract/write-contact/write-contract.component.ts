import { Component, Input, OnInit } from '@angular/core';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { TranslateService } from '@ngx-translate/core';
import { GAS_ESTIMATE, STABLE_UTOKEN } from 'src/app/core/constants/common.constant';
import { ChainsInfo } from 'src/app/core/constants/wallet.constant';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WalletService } from 'src/app/core/services/wallet.service';

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
  errorInput = false;
  currentFrom = 0;
  walletAccount: any;

  constructor(
    public walletService: WalletService,
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
    this.errorInput = false;
  }

  connectWallet(): void {
    this.walletAccount = this.walletService.getAccount();
  }

  async excuteSmartContract(name: string, currentFrom: number) {
    this.walletAccount = this.walletService.getAccount();
    if (this.walletAccount) {
      const contractTemp = this.jsonWriteContract.oneOf.find((contract) => contract.required[0] === name);
      let err = {};
      contractTemp.properties[name].required.forEach((contract) => {
        let element: HTMLInputElement = document.getElementsByClassName('form-check-input ' + name)[
          contract
        ] as HTMLInputElement;
        if (element.value.length === 0) {
          err[contract.toString()] = true;
          this.errorInput = true;
          this.currentFrom = currentFrom;
          return;
        }
      });
      contractTemp.properties[name].checkErr = err;

      if (Object.keys(contractTemp.properties[name].checkErr).length === 0) {
        let singer = window.getOfflineSignerOnlyAmino(this.walletService.chainId);
        const client = await SigningCosmWasmClient.connectWithSigner(
          ChainsInfo[this.walletService.chainId].rpc,
          singer,
        );

        const contractTemp = this.jsonWriteContract.oneOf.find((contract) => contract.required[0] === name);
        if (contractTemp) {
          let objWriteContract = {};
          contractTemp.properties[name].required.forEach((contract) => {
            let type = contractTemp.properties[name].properties[contract].type;
            let element: HTMLInputElement = document.getElementsByClassName('form-check-input ' + name)[
              contract
            ] as HTMLInputElement;
            objWriteContract[contract] = element.value;
            if (type !== 'string') {
              objWriteContract[contract] = Number(element.value);
            }
          });
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
            let result = await client.execute(this.userAddress, this.contractDetailData.contract_address, msg, fee);
            this.toastr.success(this.translate.instant('NOTICE.SUCCESS_TRANSACTION'));
          } catch (error) {
            if (!error.toString().includes('Request rejected')) {
              let msgError = error.toString() || 'Error';
              this.toastr.error(msgError);
            }
          }
        }
      }
    } else {
      this.connectWallet();
    }
  }

  resetCheck() {
    this.errorInput = false;
  }
}
