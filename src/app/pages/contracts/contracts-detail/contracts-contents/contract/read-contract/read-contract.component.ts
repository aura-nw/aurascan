import { Component, Input, OnInit } from '@angular/core';
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
  dataResponse = null;
  errorInput = false;
  isLoading = false;
  currentFrom = null;
  objQuery = [];

  constructor(public walletService: WalletService) {}

  ngOnInit(): void {
    this.jsonReadContract = JSON.parse(this.contractDetailData?.query_msg_schema);
    //auto execute query without params
    this.handleQueryContract();
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

  querySmartContract(name: string, currentFrom: number) {
    this.currentFrom = currentFrom;
    let queryData = {};
    this.dataResponse = null;
    let err = {};
    let objReadContract = {};
    const contractTemp = this.jsonReadContract.oneOf.find((contract) => contract.required[0] === name);

    //Check has required property, else execute query without params
    if (contractTemp.properties[name].hasOwnProperty('required')) {
      contractTemp.properties[name].required.forEach((contract) => {
        let element: HTMLInputElement = document.getElementsByClassName(
          'form-check-input ' + name + ' ' + contract,
        )[0] as HTMLInputElement;

        //check input null && require field
        if (element?.value?.length === 0 && element?.classList.contains('input-require')) {
          err[contract.toString()] = true;
          this.errorInput = true;
          return;
        }

        let type = contractTemp.properties[name].properties[contract].type;
        objReadContract[contract] = element?.value;

        //convert number if integer field
        if (type === 'integer' || contract === 'amount') {
          objReadContract[contract] = Number(element?.value);
        }
      });

      contractTemp.properties[name].checkErr = err;
      if (Object.keys(contractTemp.properties[name]?.checkErr).length > 0) {
        return;
      }
    }

    this.isLoading = true;
    queryData = {
      [name]: objReadContract,
    };
    this.executeQuery(queryData);
  }

  async executeQuery(queryData, saveResponse = false) {
    const client = await SigningCosmWasmClient.connect(ChainsInfo[this.walletService.chainId].rpc);
    try {
      const config = await client.queryContractSmart(this.contractDetailData.contract_address, queryData);
      if (saveResponse) {
        let element = {};
        element = config;
        this.objQuery[Object.keys(queryData)[0]] = config;
        return;
      }
      if (config) {
        this.dataResponse = config;
      }
    } catch (error) {
      this.dataResponse = 'No Data';
    }
    this.isLoading = false;
  }

  handleQueryContract(): void {
    this.jsonReadContract.oneOf.forEach((contract) => {
      let key = Object.keys(contract.properties)[0];
      let queryData = {};
      if (!contract.properties[key].hasOwnProperty('required')) {
        queryData = {
          [key]: {},
        };
        this.executeQuery(queryData, true);
      }
    });
  }

  resetCheck() {
    this.errorInput = false;
  }
}
