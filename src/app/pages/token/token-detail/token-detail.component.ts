import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { map, of, switchMap } from 'rxjs';
import { DATEFORMAT } from 'src/app/core/constants/common.constant';
import { TYPE_CW4973 } from 'src/app/core/constants/contract.constant';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { CoingeckoService } from 'src/app/core/data-services/coingecko.service';
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

  constructor(
    private router: ActivatedRoute,
    private route: Router,
    private tokenService: TokenService,
    private contractService: ContractService,
    private datePipe: DatePipe,
    private coingecko: CoingeckoService,
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
      .pipe(
        switchMap((res) => {
          const data = _.get(res, `smart_contract[0]`);

          if (data) {
            return this.coingecko.coinsMarket$.pipe(
              map((coins) => {
                const coin = coins?.find((item) => item.symbol === data.cw20_contract?.symbol);
                const {
                  price,
                  circulating_market_cap,
                  max_total_supply,
                  fully_diluted_market_cap,
                  price_change_percentage_24h,
                } = coin || {
                  price: 0,
                  circulating_market_cap: 0,
                  max_total_supply: 0,
                  fully_diluted_market_cap: 0,
                  price_change_percentage_24h: 0,
                };

                return {
                  contract_address: data.address,
                  name: data.cw20_contract?.name,
                  symbol: data.cw20_contract?.symbol,
                  decimals: data.cw20_contract?.decimal,
                  type: ContractRegisterType.CW20,
                  price,
                  circulating_market_cap,
                  max_total_supply,
                  fully_diluted_market_cap,
                  price_change_percentage_24h,
                  contract_verification: '',
                  verify_status: '',
                  verify_text: '',
                };
              }),
            );
          }

          return of(null);
        }),
      )
      .subscribe({
        next: (res) => {
          if (!res) {
            this.route.navigate(['/tokens']);
            return;
          }

          this.tokenDetail = res;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  getTokenDetailNFT(): void {
    this.contractService.loadContractDetail(this.contractAddress).subscribe(
      (res) => {
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
