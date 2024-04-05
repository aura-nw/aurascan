import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { JsonFragment } from 'ethers';
import * as _ from 'lodash';
import { of, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { ContractType } from 'src/app/core/constants/token.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { getEthersProvider } from 'src/app/core/utils/ethers';

@Component({
  selector: 'app-evm-contract',
  templateUrl: './evm-contract.component.html',
  styleUrls: ['./evm-contract.component.scss'],
})
export class EvmContractComponent implements OnInit, OnDestroy, OnChanges {
  @Input() contractTypeData: string;
  @Input() contractsAddress: string;

  ContractType = ContractType;
  ContractVerifyType = ContractVerifyType;

  currentTab = ContractType.Code;
  contractDetail: any;
  contractAbiString: string; // Need to optimize loading large object
  contractCode = '';

  implementationContractDetail: {
    proxyContract: string;
    implementationContract: string;
    previouslyRecordedContract: string;
    abi?: JsonFragment[];
  };

  destroyed$ = new Subject<void>();

  constructor(
    private contractService: ContractService,
    private env: EnvironmentService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contractsAddress'].currentValue) {
      this.getContractCode();
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.loadContractDetail();
  }

  loadContractDetail() {
    this.contractService.contractObservable.pipe(takeUntil(this.destroyed$)).subscribe((res) => {
      this.contractDetail = res;

      this.contractAbiString = this.contractDetail?.abi ? JSON.stringify(this.contractDetail?.abi) : '-';

      if (this.contractDetail.type.startsWith('PROXY')) {
        this.getProxyContractAbi(this.contractsAddress);
      }
    });
  }

  getContractCode() {
    const provider = getEthersProvider(this.env.etherJsonRpc);

    provider
      ?.getCode(this.contractsAddress)
      .then((contractCode) => {
        this.contractCode = contractCode;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  changeTab(tabId: ContractType): void {
    this.currentTab = tabId;
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
}
