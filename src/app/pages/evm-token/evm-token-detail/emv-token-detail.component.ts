import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { TYPE_CW4973 } from 'src/app/core/constants/contract.constant';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EModeEVMToken, EModeToken } from 'src/app/core/constants/token.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { IBCService } from 'src/app/core/services/ibc.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-evm-token-detail',
  templateUrl: './evm-token-detail.component.html',
  styleUrls: ['./evm-token-detail.component.scss'],
})
export class EvmTokenDetailComponent implements OnInit {
  loading = true;
  contractAddress = '';
  tokenDetail: any;
  contractType = ContractRegisterType;
  errTxt: string;
  EModeToken = EModeToken;

  chainInfo = this.environmentService.chainInfo;
  excludedAddresses = this.environmentService.chainConfig.excludedAddresses;

  constructor(
    private router: ActivatedRoute,
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
    private contractService: ContractService,
    private ibcService: IBCService,
  ) {}

  ngOnInit(): void {
    this.contractAddress = this.router.snapshot.paramMap.get('contractAddress');
    this.getTokenDetail();
  }

  getTokenDetail(): void {
    const payload = {
      address: this.contractAddress,
    };
    this.tokenService.getEvmTokenDetail(payload).subscribe({
      next: (res) => {
        const token = res.erc20_contract[0];
        if (!token) {
          this.loading = false;
          this.errTxt = 'No Data';
          return;
        }

        this.tokenDetail = {
          ...token,
          supplyAmount: token.total_supply,
          modeToken: EModeEVMToken.ERC20,
          contract_address: this.contractAddress,
          decimals: token.decimal,
          price: 0,
        };
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
        const modeToken = EModeToken.CWToken;
        this.tokenDetail = { name, type, contract_address, isNFTContract, modeToken };
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

  getMoreTx(event) {
    this.tokenDetail['hasMoreTx'] = event;
  }

  getInfoTokenIBC(denom) {
    this.ibcService.getChannelInfoByDenom(encodeURIComponent(denom)).subscribe((res) => {
      this.tokenDetail['channelPath'] = _.get(res, 'denom_trace');
    });
  }
}
