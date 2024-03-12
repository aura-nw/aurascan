import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
  contractCode = '';

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
}
