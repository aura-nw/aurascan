import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ResponseDto } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-token-detail',
  templateUrl: './token-detail.component.html',
  styleUrls: ['./token-detail.component.scss'],
})
export class TokenDetailComponent implements OnInit {
  loading = true;
  contractAddress = '';
  tokenDetail: any;
  image_s3 = this.environmentService.configValue.image_s3;
  defaultLogoToken = this.image_s3 + 'images/icons/token-logo.png';

  constructor(
    private router: ActivatedRoute,
    private route: Router,
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
    private contractService: ContractService,
  ) {}

  ngOnInit(): void {
    this.contractAddress = this.router.snapshot.paramMap.get('contractAddress');
    if (this.contractAddress === 'null') {
      this.route.navigate(['/']);
    }

    if (this.router.snapshot.url[0]?.path === 'token') {
      this.getTokenDetail();
    } else {
      this.getTokenDetailNFT();
    }
  }

  getTokenDetail(): void {
    this.tokenService.getTokenDetail(this.contractAddress).subscribe(
      (res: ResponseDto) => {
        this.tokenDetail = res.data;
      },
      () => {},
      () => {
        this.loading = false;
      },
    );
  }

  getTokenDetailNFT(): void {
    this.contractService.loadContractDetail(this.contractAddress).subscribe(
      (res) => {
        const name = _.get(res, 'smart_contract[0].cw721_contract.name');
        let type = ContractRegisterType.CW721;
        const isNFTContract = true;
        const contract_address = _.get(res, 'smart_contract[0].address');
        this.tokenDetail = { name, type, contract_address, isNFTContract };
      },
      () => {},
      () => {
        this.loading = false;
      },
    );
  }

  getLength(result: string) {
    this.tokenDetail['totalTransfer'] = Number(result) || 0;
  }

  getMoreTx(event) {
    this.tokenDetail['hasMoreTx'] = event;
  }
}
