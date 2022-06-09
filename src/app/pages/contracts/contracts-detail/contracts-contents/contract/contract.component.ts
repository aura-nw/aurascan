import { Component, Input, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { ResponseDto } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { ContractType } from '../../../../../core/constants/token.enum';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss'],
})
export class ContractComponent implements OnInit {
  @Input() contractTypeData: string;
  @Input() contractsAddress: string;

  contractType = ContractType;
  countCurrent = this.contractType.Code;
  contractVerifyType = ContractVerifyType;
  contractAddress: string;
  contractDetail: any;
  constructor(
      private contractService: ContractService,
      private route: ActivatedRoute,
      private router: Router
  ) { }

  ngOnInit(): void {
    this.contractAddress = this.route.snapshot.paramMap.get('contractAddress');
    this.getContractDetail();
  }

  getContractDetail() {
    this.contractService.getContractDetail(this.contractAddress).subscribe((res: ResponseDto) => {
      this.contractDetail = res?.data;
      console.log(this.contractDetail)
    });
  }
  navigateContractDetail() {
    this.router.navigate(['contracts/verify'],
    { state: {
            contractAddress: this.contractAddress,
            contractTxHash: this.contractDetail.tx_hash,
            contractName: this.contractDetail.contract_name,
          }
        });
  }

  changeTab(tabId): void {
    this.countCurrent = tabId;
  }
}
