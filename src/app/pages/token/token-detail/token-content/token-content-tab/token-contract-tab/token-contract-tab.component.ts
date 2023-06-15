import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContractRegisterType, ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { ResponseDto } from 'src/app/core/models/common.model';
import { TokenService } from 'src/app/core/services/token.service';
import { TokenContractType } from '../../../../../../core/constants/token.enum';
import { ContractService } from 'src/app/core/services/contract.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-token-contract-tab',
  templateUrl: './token-contract-tab.component.html',
  styleUrls: ['./token-contract-tab.component.scss'],
})
export class TokenContractTabComponent implements OnInit {
  @Input() contractAddress: string;
  @Input() typeContract: string;

  contractType = TokenContractType;
  countCurrent = this.contractType.ReadContract;
  tokenDetail: any;
  contractVerifyType = ContractVerifyType;

  constructor(private tokenService: TokenService, private router: Router, private contractService: ContractService) {}

  ngOnInit(): void {
    if (this.typeContract !== ContractRegisterType.CW20) {
      this.getContractDetailNFT();
    } else {
      this.getContractDetail();
    }
  }

  changeTab(tabId): void {
    this.countCurrent = tabId;
  }

  getContractDetail() {
    this.tokenService.getContractDetail(this.contractAddress).subscribe((res: ResponseDto) => {
      // check data for type cw20 v1
      if (res.data.contract_verification === 'VERIFIED') {
        res.data.contract_verification = ContractVerifyType.Verified;
      } else if (res.data.contract_verification === 'VERIFYFAIL') {
        res.data.contract_verification = ContractVerifyType.VerifiedFail;
      }
      this.tokenDetail = res?.data;
    });
  }

  getContractDetailNFT() {
    this.contractService.loadContractDetailV2(this.contractAddress).subscribe((res: ResponseDto) => {
      if (res['smart_contract']?.length > 0) {
        let data = res['smart_contract'][0];
        let contract_verification = data?.code?.code_id_verifications[0]?.verification_status;
        let execute_msg_schema = _.get(data, 'code.code_id_verifications[0].execute_msg_schema');
        let query_msg_schema = _.get(data, 'code.code_id_verifications[0].query_msg_schema');
        let tx_hash = data.instantiate_hash;

        this.tokenDetail = { contract_verification, execute_msg_schema, query_msg_schema, tx_hash };
      }
    });
  }

  navigateToVerify() {
    sessionStorage.setItem('codeIdPrePage', this.router.url);
    this.router.navigate(['/code-ids/verify', this.tokenDetail.code_id]);
  }
}
