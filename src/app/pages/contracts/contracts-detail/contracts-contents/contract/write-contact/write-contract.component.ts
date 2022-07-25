import { Component, Input, OnInit } from '@angular/core';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { TranslateService } from '@ngx-translate/core';
import { GAS_ESTIMATE } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
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
  objDefine = {};

  chainInfo = this.environmentService.configValue.chain_info;

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;

  constructor(
    public walletService: WalletService,
    private toastr: NgxToastrService,
    public translate: TranslateService,
    private environmentService: EnvironmentService,
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

  async executeSmartContract(name: string, currentFrom: number) {
    this.connectWallet();
    if (this.walletAccount) {
      let err = {};
      let objWriteContract = {};
      let msg = {};
      const contractTemp = this.jsonWriteContract.oneOf.find((contract) => contract.required[0] === name);
      if (contractTemp.properties[name].hasOwnProperty('properties')) {
        Object.entries(contractTemp.properties[name].properties).forEach(([key, value]) => {
          let element: HTMLInputElement = document.getElementsByClassName(
            'form-check-input ' + name + ' ' + key,
          )[0] as HTMLInputElement;

          //check input null && require field
          if (element?.value?.length === 0 && element?.classList.contains('input-require')) {
            err[key.toString()] = true;
            this.errorInput = true;
            this.currentFrom = currentFrom;
            return;
          }

          let type = contractTemp.properties[name].properties[key].type;
          objWriteContract[key] = element?.value;
          //convert number if integer field
          if (type === 'integer') {
            objWriteContract[key] = Number(element?.value);
          }
        });
      }
      //check exit ref define
      else if (contractTemp.properties[name].hasOwnProperty('$ref')) {
        let objectTemp = contractTemp.properties[name].$ref.replace('#/', '')?.split('/');
        const contractRef = this.jsonWriteContract[objectTemp[0]][objectTemp[1]];
        Object.entries(contractRef.properties).forEach(([key, value]) => {
          let element: HTMLInputElement = document.getElementsByClassName(
            'form-check-input ' + name + ' ' + key,
          )[0] as HTMLInputElement;

          //check input null && require field
          if (element?.value?.length === 0 && element?.classList.contains('input-require')) {
            err[key.toString()] = true;
            this.errorInput = true;
            this.currentFrom = currentFrom;
            return;
          }

          let type = contractRef.properties[key].type || 'string';
          if (element?.value) {
            objWriteContract[key] = element?.value;
          }
          //convert number if integer field
          if (type === 'integer') {
            objWriteContract[key] = Number(element?.value);
          }
        });
      }
      contractTemp.properties[name].checkErr = err;

      if (Object.keys(contractTemp.properties[name]?.checkErr).length > 0) {
        return;
      }

      msg = {
        [name]: objWriteContract,
      };
      let singer = window.getOfflineSignerOnlyAmino(this.walletService.chainId);
      const client = await SigningCosmWasmClient.connectWithSigner(this.chainInfo.rpc, singer);
      const fee: any = {
        amount: [
          {
            denom: this.coinMinimalDenom,
            amount: '1',
          },
        ],
        gas: GAS_ESTIMATE,
      };
      try {
        await client.execute(this.userAddress, this.contractDetailData.contract_address, msg, fee);
        contractTemp.properties[name].checkErr = null;
        this.toastr.success(this.translate.instant('NOTICE.SUCCESS_TRANSACTION'));
      } catch (error) {
        if (!error.toString().includes('Request rejected')) {
          let msgError = error.toString() || 'Error';
          this.toastr.error(msgError);
        }
      }
    }
  }

  resetCheck() {
    this.errorInput = false;
  }

  objectKeys(obj) {
    return obj ? Object.keys(obj) : [];
  }

  objectRef(ref, getType = false, contractDetail = null) {
    if (!ref) {
      return 'any';
    }
    
    let objectTemp = ref.replace('#/', '')?.split('/');
    let obj = this.jsonWriteContract[objectTemp[0]][objectTemp[1]];
    let data = {};
    if (obj) {
      data = { key: objectTemp, value: obj };
    }
    if (contractDetail) {
      this.objDefine[Object.keys(contractDetail.properties)[0]] = data;
    }
    if (getType) {
      return obj.type || 'string';
    } else {
      return obj?.properties ? Object.keys(obj?.properties) : [];
    }
  }

  checkRequire(item, objDefine): boolean {
    if (objDefine.value.required.includes(item)) {
      return true;
    }
    return false;
  }
}
