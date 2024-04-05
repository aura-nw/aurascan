import { Component, Input, OnInit } from '@angular/core';
import { JsonFragment } from 'ethers';
import * as _ from 'lodash';
import { of, switchMap } from 'rxjs';
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
  isImplementationVerified = false;
  implementationContractAddress = '';
  implementationContractDetail: {
    proxyContract: string;
    implementationContract: string;
    previouslyRecordedContract: string;
    abi?: JsonFragment[];
  };

  constructor(
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

  getProxyContractAbi(address) {
    this.contractService
      .getProxyContractAbi(address)
      .pipe(
        switchMap((e) => {
          const proxyHistories = _.get(e, 'evm_smart_contract[0].evm_proxy_histories');

          if (proxyHistories) {
            this.implementationContractDetail = {
              proxyContract: proxyHistories[0]?.proxy_contract,
              implementationContract: proxyHistories[0]?.implementation_contract,
              previouslyRecordedContract: proxyHistories[1]?.implementation_contract,
            };

            return this.contractService.queryEvmContractByAddress(
              this.implementationContractDetail.implementationContract,
            );
          }

          return of(null);
        }),
      )
      .subscribe((res) => {
        const abi = _.get(res, 'evm_contract_verification[0].abi');
        if (abi) {
          this.implementationContractDetail['abi'] = abi as JsonFragment[];
        }
      });
  }

  loadProxyContractDetail() {
    this.contractService.loadProxyContractDetail(this.contractAddress).subscribe((res) => {
      if (res.implementation_contract) {
        this.implementationContractAddress = res.implementation_contract;
        this.getListContractInfo(res.implementation_contract);
      }
    });
  }

  getListContractInfo(address) {
    this.contractService.getListContractInfo(address).subscribe((res) => {
      if (res?.evm_contract_verification?.length > 0) {
        this.isImplementationVerified = res.evm_contract_verification[0]?.status;
      }
    });
  }
}
