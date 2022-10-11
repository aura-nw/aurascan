import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { mergeMap } from 'rxjs/operators';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { ContractType } from 'src/app/core/constants/token.enum';
import { IResponsesTemplates } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss'],
})
export class ContractComponent implements OnInit, OnDestroy {
  @Input() contractTypeData: string;
  @Input() contractsAddress: string;

  contractType = ContractType;
  countCurrent = this.contractType.Code;
  contractVerifyType = ContractVerifyType;
  contractAddress: string;
  contractDetail: any;
  isVerifying = false;

  constructor(private contractService: ContractService, private route: ActivatedRoute) {}

  ngOnDestroy(): void {}

  ngOnInit(): void {
    this.contractAddress = this.route.snapshot.paramMap.get('contractAddress');
    this.getContractDetail2();
  }

  getContractDetail(notCheck = false) {
    this.contractService
      .checkVerified(this.contractAddress)
      .pipe(
        mergeMap(({ data }) => {
          if (data?.status === 'verifying' && !notCheck) {
            this.isVerifying = true;
          } else {
            this.isVerifying = false;
          }

          return this.contractService.contractObservable;
        }),
      )
      .subscribe((res: IResponsesTemplates<any>) => {
        if (res.data) {
          this.contractDetail = res.data;
        }
      });
  }

  getContractDetail2(notCheck = false) {
    this.contractService.contractObservable
      .pipe(
        mergeMap(({ data }) => {
          if (data) {
            this.contractDetail = data;
          }
          if (data?.status === 'verifying' && !notCheck) {
            this.isVerifying = true;
          } else {
            this.isVerifying = false;
          }

          return this.contractService.checkVerified(this.contractAddress);
        }),
      )
      .subscribe(({ data }) => {
        if (data?.status === 'verifying' && !notCheck) {
          this.isVerifying = true;
        } else {
          this.isVerifying = false;
        }
      });
  }

  changeTab(tabId): void {
    this.countCurrent = tabId;
  }
}
