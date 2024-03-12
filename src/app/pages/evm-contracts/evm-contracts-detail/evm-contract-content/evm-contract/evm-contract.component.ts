import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import _ from 'lodash';
import { mergeMap } from 'rxjs/operators';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { ContractType } from 'src/app/core/constants/token.enum';
import { ContractService } from 'src/app/core/services/contract.service';

@Component({
  selector: 'app-evm-contract',
  templateUrl: './evm-contract.component.html',
  styleUrls: ['./evm-contract.component.scss'],
})
export class EvmContractComponent implements OnInit {
  @Input() contractTypeData: string;
  @Input() contractsAddress: string;

  ContractType = ContractType;
  ContractVerifyType = ContractVerifyType;

  currentTab = ContractType.Code;
  contractDetail: any;

  constructor(
    private contractService: ContractService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadContractDetail();
  }

  loadContractDetail() {
    this.contractService.contractObservable
      .pipe(
        mergeMap((res) => {
          if (res) {
            this.contractDetail = res;
          }

          return this.contractService.checkVerified(this.contractDetail?.code?.code_id);
        }),
      )
      .subscribe(({ data }) => {
        this.contractTypeData = data.status || this.contractTypeData;
      });
  }

  changeTab(tabId: ContractType): void {
    this.currentTab = tabId;
  }
}
