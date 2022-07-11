import { Component, Input, OnInit } from '@angular/core';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { WalletService } from 'src/app/core/services/wallet.service';

@Component({
  selector: 'app-token-contract-read',
  templateUrl: './token-contract-read.component.html',
  styleUrls: ['./token-contract-read.component.scss'],
})
export class TokenContractReadComponent implements OnInit {
  @Input() tokenDetailData: any;

  isExpand = false;
  jsonReadContract: any;
  idRead: string = '';
  dataResponse: any;
  errorInput = false;
  isLoading = false;

  chainInfo = this.environmentService.configValue.chain_info;

  constructor(public walletService: WalletService, private environmentService: EnvironmentService) {}

  ngOnInit(): void {
    this.jsonReadContract = JSON.parse(this.tokenDetailData?.query_msg_schema);
  }

  expandMenu(closeAll = false): void {
    for (let i = 0; i < document.getElementsByClassName('content-token').length; i++) {
      let element: HTMLElement = document.getElementsByClassName('content-token')[i] as HTMLElement;
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

  async querySmartContract(name: string) {
    this.isLoading = true;
    if (this.idRead?.length === 0) {
      this.errorInput = true;
      this.isLoading = false;
      return;
    }
    let queryData = {
      [name]: { id: this.idRead },
    };
    const client = await SigningCosmWasmClient.connect(this.chainInfo.rpc);

    try {
      const config = await client.queryContractSmart(this.tokenDetailData.contract_address, queryData);

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
