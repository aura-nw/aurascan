import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  tokenAddress = 'aura17p9rzwnnfxcjp32un9ug7yhhzgtkhvl9jfksztgw5uh69wac2pgs67zyav';
  constructor(private tokenService: TokenService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // this.tokenAddress = this.route.snapshot.paramMap.get('tokenId');
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
