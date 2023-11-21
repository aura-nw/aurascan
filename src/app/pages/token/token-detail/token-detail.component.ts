import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { DATEFORMAT, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { TYPE_CW4973 } from 'src/app/core/constants/contract.constant';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
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
  image_s3 = this.environmentService.imageUrl;
  defaultLogoToken = this.image_s3 + 'images/icons/token-logo.png';
  contractType = ContractRegisterType;
  errTxt: string;

  constructor(
    private router: ActivatedRoute,
    private route: Router,
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
    private contractService: ContractService,
    private datePipe: DatePipe,
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
    let now = new Date();
    now.setDate(now.getDate() - 1);
    this.tokenService
      .getTokenDetail(this.contractAddress, this.datePipe.transform(now, DATEFORMAT.DATE_ONLY))
      .subscribe({
        next: (res) => {
          const data = _.get(res, `smart_contract`);
          if (data.length > 0) {
            const reqPayload = { contractAddress: data[0].address };
            this.tokenService.getTokenMarketData(reqPayload).subscribe((item) => {
              const token = data[0];
              const tokenMarket = item.length > 0 ? item[0] : null;
              token.contract_address = data[0].address;
              token.name = data[0].cw20_contract.name;
              token.symbol = data[0].cw20_contract.symbol;
              token.decimals = data[0].cw20_contract.decimal;
              token.type = this.contractType.CW20;
              token.contract_address = data[0].address;
              token.max_total_supply = tokenMarket?.max_supply || 0;
              token.circulating_market_cap = tokenMarket?.circulating_market_cap || 0;
              token.price = tokenMarket?.current_price || 0;
              token.verify_status = tokenMarket?.verify_status || '';
              token.verify_text = tokenMarket?.verify_text || '';
              token.fully_diluted_market_cap =
                tokenMarket?.fully_diluted_valuation || token.max_total_supply * token.price;
              token.price_change_percentage_24h = tokenMarket?.price_change_percentage_24h || 0;
              token.contract_verification = data[0].code?.code_id_verifications[0]?.verification_status;
              this.tokenDetail = token;
            });
          }
        },
        error: (e) => {
          if (e.name === TIMEOUT_ERROR) {
            this.errTxt = e.message;
          } else {
            this.errTxt = e.status + ' ' + e.statusText;
          }
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  getTokenDetailNFT(): void {
    this.contractService.loadContractDetail(this.contractAddress).subscribe({
      next: (res) => {
        const name = _.get(res, 'smart_contract[0].cw721_contract.name');
        let type = ContractRegisterType.CW721;
        if (res.smart_contract[0]?.name === TYPE_CW4973) {
          type = ContractRegisterType.CW4973;
        }
        const isNFTContract = true;
        const contract_address = _.get(res, 'smart_contract[0].address');
        this.tokenDetail = { name, type, contract_address, isNFTContract };
        this.tokenDetail.contract_verification =
          res.smart_contract[0].code.code_id_verifications[0]?.verification_status;
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.status + ' ' + e.statusText;
        }
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  getLength(result: string) {
    this.tokenDetail['totalTransfer'] = Number(result) || 0;
  }

  getMoreTx(event) {
    this.tokenDetail['hasMoreTx'] = event;
  }
}
