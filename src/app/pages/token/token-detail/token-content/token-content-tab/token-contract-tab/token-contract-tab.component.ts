import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { ContractService } from 'src/app/core/services/contract.service';
import { TokenContractType } from '../../../../../../core/constants/token.enum';

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

  constructor(private router: Router, private contractService: ContractService) {}

  ngOnInit(): void {
    this.getContractDetail();
  }

  changeTab(tabId): void {
    this.countCurrent = tabId;
  }

  getContractDetail() {
    this.contractService.loadContractDetail(this.contractAddress).subscribe((res) => {
      if (res['smart_contract']?.length > 0) {
        let data = res['smart_contract'][0];
        let contract_verification = data?.code?.code_id_verifications[0]?.verification_status;
        let execute_msg_schema = _.get(data, 'code.code_id_verifications[0].execute_msg_schema');
        let query_msg_schema = _.get(data, 'code.code_id_verifications[0].query_msg_schema');
        let tx_hash = data.instantiate_hash;
        let code_id = _.get(data, 'code.code_id');
        let address = data.address;
        this.tokenDetail = { contract_verification, execute_msg_schema, query_msg_schema, tx_hash, code_id, address };
      }
    });
  }

  navigateToVerify() {
    sessionStorage.setItem('codeIdPrePage', this.router.url);
    this.router.navigate(['/code-ids/verify', this.tokenDetail.code_id]);
  }
}
