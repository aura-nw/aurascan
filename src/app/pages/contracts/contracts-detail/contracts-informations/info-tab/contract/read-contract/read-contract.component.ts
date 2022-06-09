import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ContractService } from 'src/app/core/services/contract.service';
import { SigningCosmWasmClient } from 'cosmwasm';
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
  idRead: string = '';
  dataResponse: any;
  errorInput = false;
  isLoading = false;

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
  }

  async querySmartContract(name: string) {
    this.isLoading = true;
    if (this.idRead?.length === 0) {
      this.errorInput = true;
      return;
    }
    let queryData = {
      [name]: { id: this.idRead },
    };
    const client = await SigningCosmWasmClient.connect(ChainsInfo[this.walletService.chainId].rpc);

    try {
      const config = await client.queryContractSmart(
        this.contractDetailData.contract_address,
        queryData,
      );

      if (config) {
        this.dataResponse = JSON.stringify(config);
      }
    } catch (error) {
      this.dataResponse = 'No Data';
    }
    this.isLoading = false;
  }

  resetCheck() {
    this.errorInput = false;
  }
}
