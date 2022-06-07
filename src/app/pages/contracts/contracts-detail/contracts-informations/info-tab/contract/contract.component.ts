import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { ResponseDto } from 'src/app/core/models/common.model';
import { ContractDetailDto } from 'src/app/core/models/contract.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { ContractType } from '../../../../../../core/constants/token.enum';

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
  constructor(private contractService: ContractService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.contractAddress = this.route.snapshot.paramMap.get('contractAddress');
    this.getContractDetail();
  }

  getContractDetail() {
    this.contractService.getContractDetail(this.contractAddress).subscribe((res: ResponseDto) => {
      this.contractDetail = res?.data;
    });
  }


  changeTab(tabId): void {
    this.countCurrent = tabId;
  }
}
