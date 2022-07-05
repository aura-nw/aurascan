import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ContractService } from 'src/app/core/services/contract.service';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { ChainsInfo } from 'src/app/core/constants/wallet.constant';
import { WalletService } from 'src/app/core/services/wallet.service';
@Component({
  selector: 'app-read-contract',
  templateUrl: './read-contract.component.html',
  styleUrls: ['./read-contract.component.scss'],
})
export class ReadContractComponent implements OnInit {
  @Input() contractDetailData: any;

  isExpand = false;
  jsonReadContract: any;
  dataResponse: any;
  errorInput = false;
  isLoading = false;
  currentFrom = 0;

  constructor(public walletService: WalletService) {}

  ngOnInit(): void {
    this.jsonReadContract = JSON.parse(this.contractDetailData?.query_msg_schema);
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
    this.dataResponse = null;
    this.errorInput = false;
  }

  async querySmartContract(name: string, currentFrom: number) {
    this.isLoading = true;
    this.currentFrom = currentFrom;
    let queryData;
    this.dataResponse = null;
    let err = {};
    const contractTemp = this.jsonReadContract.oneOf.find((contract) => contract.required[0] === name);
    if (contractTemp.properties[name].hasOwnProperty('required')) {
      contractTemp.properties[name].required.forEach((contract) => {
        let element: HTMLInputElement = document.getElementsByClassName(
          'form-check-input ' + name + ' ' + contract,
        )[0] as HTMLInputElement;

        if (element?.value?.length === 0) {
          err[contract.toString()] = true;
          this.errorInput = true;
          return;
        }
      });
      contractTemp.properties[name].checkErr = err;

      if (Object.keys(contractTemp.properties[name]?.checkErr).length === 0) {
        let objReadContract = {};
        contractTemp.properties[name].required.forEach((contract) => {
          let type = contractTemp.properties[name].properties[contract].type;
          let element: HTMLInputElement = document.getElementsByClassName(
            'form-check-input ' + name + ' ' + contract,
          )[0] as HTMLInputElement;
          objReadContract[contract] = element?.value;
          if (type !== 'string') {
            objReadContract[contract] = Number(element?.value);
          }
        });
        queryData = {
          [name]: objReadContract,
        };
        const client = await SigningCosmWasmClient.connect(ChainsInfo[this.walletService.chainId].rpc);

        try {
          const config = await client.queryContractSmart(this.contractDetailData.contract_address, queryData);
          if (config) {
            this.dataResponse = JSON.stringify(config);
          }
        } catch (error) {
          this.dataResponse = 'No Data';
        }
      }
      this.isLoading = false;
    }
  }

  resetCheck() {
    this.errorInput = false;
  }
}
