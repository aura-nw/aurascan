import {Component, Input, OnInit} from '@angular/core';
import {ContractType} from "src/app/core/constants/token.enum";
import {ContractVerifyType} from "src/app/core/constants/contract.enum";
import {ContractService} from "src/app/core/services/contract.service";
import {ActivatedRoute, Router} from "@angular/router";
import {mergeMap} from "rxjs/operators";
import _ from "lodash";

@Component({
  selector: 'app-evm-contract',
  templateUrl: './evm-contract.component.html',
  styleUrls: ['./evm-contract.component.scss']
})
export class EvmContractComponent implements OnInit {
  @Input() contractTypeData: string;
  @Input() contractsAddress: string;

  contractType = ContractType;
  currentTab = this.contractType.Code;
  contractVerifyType = ContractVerifyType;
  contractAddress: string;
  contractDetail: any;
  isVerifying = false;

  constructor(private contractService: ContractService, private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit(): void {
    this.contractAddress = this.route.snapshot.paramMap.get('contractAddress');
    this.getContractDetail();
  }

  getContractDetail(notCheck = false) {
    this.contractService.contractObservable
      .pipe(
        mergeMap((res) => {
          if (res) {
            res.tx_hash = res.instantiate_hash;
            res.execute_msg_schema = _.get(res, 'code.code_id_verifications[0].execute_msg_schema');
            res.instantiate_msg_schema = _.get(res, 'code.code_id_verifications[0].instantiate_msg_schema');
            res.query_msg_schema = _.get(res, 'code.code_id_verifications[0].query_msg_schema');
            res.contract_hash = _.get(res, 'code.code_id_verifications[0].data_hash');
            if (res?.cw20_contract) {
              res.contract_name = _.get(res, 'cw20_contract.name');
            } else {
              res.contract_name = _.get(res, 'cw721_contract.name');
            }
            res.compiler_version = _.get(res, 'code.code_id_verifications[0].compiler_version');
            this.contractDetail = res;
          }
          if (res?.code?.code_id_verifications[0]?.verification_status === 'verifying' && !notCheck) {
            this.isVerifying = true;
          } else {
            this.isVerifying = false;
          }
          return this.contractService.checkVerified(this.contractDetail?.code?.code_id);
        }),
      )
      .subscribe(({data}) => {
        this.contractTypeData = data.status || this.contractTypeData;
        if (data?.status === 'verifying' && !notCheck) {
          this.isVerifying = true;
        } else {
          this.isVerifying = false;
        }
      });
  }

  changeTab(tabId): void {
    this.currentTab = tabId;
  }

  navigateToVerify(codeId: string) {
    sessionStorage.setItem('codeIdPrePage', this.router.url);
    this.router.navigate(['/code-ids/verify', codeId]);
  }
}
