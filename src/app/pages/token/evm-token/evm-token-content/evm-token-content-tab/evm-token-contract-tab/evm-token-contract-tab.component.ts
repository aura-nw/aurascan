import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { TokenContractType } from 'src/app/core/constants/token.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { getEthersProvider } from 'src/app/core/utils/ethers';

@Component({
  selector: 'app-evm-token-contract-tab',
  templateUrl: './evm-token-contract-tab.component.html',
  styleUrls: ['./evm-token-contract-tab.component.scss'],
})
export class EvmTokenContractTabComponent implements OnInit {
  @Input() contractAddress: string;
  @Input() typeContract: string;

  contractType = TokenContractType;
  currentTab = this.contractType.ReadContract;
  contractVerifyType = ContractVerifyType;
  isLoading = true;

  contractDetail;
  contractCode;

  constructor(
    private router: Router,
    private contractService: ContractService,
    private env: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.getContractDetail();
  }

  changeTab(tabId): void {
    this.currentTab = tabId;
  }

  getContractCode() {
    const provider = getEthersProvider(this.env.etherJsonRpc);

    provider
      ?.getCode(this.contractAddress)
      .then((contractCode) => {
        this.contractCode = contractCode;

        this.isLoading = false;
      })
      .catch((error) => {
        console.error(error);
        this.isLoading = false;
      });
  }

  getContractDetail() {
    this.contractService.queryEvmContractByAddress(this.contractAddress).subscribe({
      next: (res) => {
        if (res) {
          const evm_contract_verification = _.get(res, 'evm_contract_verification[0]');
          const evm_smart_contract = _.get(res, 'evm_smart_contract[0]') || {};

          if (!evm_contract_verification) {
            this.getContractCode();
          } else {
            this.contractDetail = {
              ...evm_smart_contract,
              ...evm_contract_verification,
            };

            this.isLoading = false;
          }
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}
