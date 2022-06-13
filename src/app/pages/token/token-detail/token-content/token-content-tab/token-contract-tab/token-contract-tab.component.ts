import { Component, OnInit } from '@angular/core';
import { ResponseDto } from 'src/app/core/models/common.model';
import { TokenService } from 'src/app/core/services/token.service';
import { TokenContractType } from '../../../../../../core/constants/token.enum';

@Component({
  selector: 'app-token-contract-tab',
  templateUrl: './token-contract-tab.component.html',
  styleUrls: ['./token-contract-tab.component.scss']
})
export class TokenContractTabComponent implements OnInit {
  contractType = TokenContractType;
  countCurrent = this.contractType.ReadContract;
  tokenDetail: any;
  tokenAddress = 'aura12z35p5vjnucp03c43kufq3lrxmnatmwetnyfqwc9z96c24wdwxtssjc7pe';
  constructor(private tokenService: TokenService) { }

  ngOnInit(): void {
    this.getContractDetail();
  }

  changeTab(tabId): void {
    this.countCurrent = tabId;
  }

  getContractDetail() {
    this.tokenService.getTokenDetail(this.tokenAddress).subscribe((res: ResponseDto) => {
      this.tokenDetail = res?.data;
    });
  }
}
