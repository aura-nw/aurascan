import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JsonFragment } from 'ethers';
import * as _ from 'lodash';
import { Subject, map, of, switchMap, takeUntil } from 'rxjs';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { ContractType } from 'src/app/core/constants/token.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { getEthersProvider } from 'src/app/core/utils/ethers';
import { EWalletType } from '../../../../../core/constants/wallet.constant';
import local from '../../../../../core/utils/storage/local';
import { STORAGE_KEYS } from '../../../../../core/constants/common.constant';

@Component({
  selector: 'app-evm-token-contract-tab',
  templateUrl: './evm-token-contract-tab.component.html',
  styleUrls: ['./evm-token-contract-tab.component.scss'],
})
export class EvmTokenContractTabComponent implements OnInit {
  @Input() contractAddress: string;
  @Input() contractTypeData: string;

  ContractType = ContractType;
  ContractVerifyType = ContractVerifyType;
  currentTab = this.ContractType.ReadContract;
  isLoading = true;
  isWatchList = false;

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

  contract$ = this.route.paramMap.pipe(
    map((data) => {
      return data.get('contractAddress');
    }),
  );
  destroyed$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private contractService: ContractService,
    private env: EnvironmentService,
  ) { }

  ngOnInit(): void {
    this.contract$
      .pipe(
        switchMap((ca) => {
          if (!ca) {
            return of(null);
          }
          this.contractAddress = ca;
          return this.contractService.queryEvmContractByAddress(ca);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe((res) => {
        this.isLoading = false;

        if (res) {
          const evm_contract_verification = _.get(res, 'evm_contract_verification[0]') || {};
          const evm_smart_contract = _.get(res, 'evm_smart_contract[0]') || {};

          const contractDetail = {
            ...evm_smart_contract,
            ...evm_contract_verification,
          };
          this.contractService.setContract(contractDetail);
        }
      });

    this.contractService.contractObservable.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (res) => {
        this.contractDetail = {
          ...res,
          tx_hash: res.created_hash,
          contract_hash: res.code_hash,
        };
      },
    });
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


}
