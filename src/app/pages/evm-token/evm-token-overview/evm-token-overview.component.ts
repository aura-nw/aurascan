import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { ContractRegisterType, EvmContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EModeEvmToken, EModeToken } from 'src/app/core/constants/token.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-evm-token-overview',
  templateUrl: './evm-token-overview.component.html',
  styleUrls: ['./evm-token-overview.component.scss'],
})
export class EvmTokenOverviewComponent implements OnInit {
  @Input() tokenDetail: any;
  params = '';
  contractType = EvmContractRegisterType;
  EModeEvmToken = EModeEvmToken;

  denom = this.environmentService.chainInfo.currencies[0].coinDenom;

  constructor(
    public tokenService: TokenService,
    private route: ActivatedRoute,
    private environmentService: EnvironmentService,
  ) {}

  ngOnDestroy(): void {
    this.tokenService.setTotalTransfer(null);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params?.a || '';
    });

    this.getDataDetail();

    //set price change
    this.tokenDetail['change'] = this.tokenDetail['change'] || this.tokenDetail.priceChangePercentage24h;
    this.tokenDetail['isValueUp'] = true;
    if (this.tokenDetail['change'] < 0) {
      this.tokenDetail['isValueUp'] = false;
      this.tokenDetail.change = Number(this.tokenDetail.change.toString().substring(1));
    }
    this.tokenDetail['isHolderUp'] = true;
  }

  getDataDetail() {}
}
