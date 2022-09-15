import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { ResponseDto } from 'src/app/core/models/common.model';
import { TokenService } from 'src/app/core/services/token.service';
import { TokenContractType } from '../../../../../../core/constants/token.enum';

@Component({
  selector: 'app-token-contract-tab',
  templateUrl: './token-contract-tab.component.html',
  styleUrls: ['./token-contract-tab.component.scss'],
})
export class TokenContractTabComponent implements OnInit {
  @Input() contractAddress: string;

  contractType = TokenContractType;
  countCurrent = this.contractType.ReadContract;
  tokenDetail: any;
  contractVerifyType = ContractVerifyType;

  constructor(private tokenService: TokenService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.getContractDetail();
  }

  changeTab(tabId): void {
    this.countCurrent = tabId;
  }

  getContractDetail() {
    this.tokenService.getContractDetail(this.contractAddress).subscribe((res: ResponseDto) => {
      this.tokenDetail = res?.data;
    });
  }
}
