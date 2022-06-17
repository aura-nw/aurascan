import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mergeMap } from 'rxjs/operators';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { IResponsesTemplates } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { WSService } from 'src/app/core/services/ws.service';
import { ContractType } from '../../../../../core/constants/token.enum';

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

  constructor(
    private contractService: ContractService,
    private route: ActivatedRoute,
    private router: Router,
    private wSService: WSService,
  ) {}

  ngOnDestroy(): void {
    this.wSService.socket?.disconnect();
  }

  ngOnInit(): void {
    this.contractAddress = this.route.snapshot.paramMap.get('contractAddress');
    this.getContractDetail();
  }

  getContractDetail(notCheck = false) {
    this.contractService
      .checkVerified(this.contractAddress)
      .pipe(
        mergeMap(({ data }) => {
          if (data?.status === 'verifying' && !notCheck) {
            this.isVerifying = true;
            this.socket();
          } else {
            this.isVerifying = false;
          }

          return this.contractService.getContractDetail(this.contractAddress);
        }),
      )
      .subscribe((res: IResponsesTemplates<any>) => {
        if (res.data) {
          this.contractDetail = res.data;
        }
      });
  }

  navigateContractDetail() {
    this.router.navigate(['contracts/verify'], {
      state: {
        contractAddress: this.contractAddress,
        contractTxHash: this.contractDetail.tx_hash,
        contractName: this.contractDetail.contract_name,
      },
    });
  }

  changeTab(tabId): void {
    this.countCurrent = tabId;
  }

  socket(): void {
    this.wSService.connect();
    const wsData = { event: 'eventVerifyContract' };
    this.wSService.on('register', wsData).subscribe((data: any) => {
      if (this.contractAddress === data?.ContractAddress) {
        this.getContractDetail(true);
      }
    });
  }
}
