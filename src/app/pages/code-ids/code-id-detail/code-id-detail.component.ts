import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { LENGTH_CHARACTER, STORAGE_KEYS, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { TYPE_CW4973 } from 'src/app/core/constants/contract.constant';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { ContractService } from 'src/app/core/services/contract.service';
import local from 'src/app/core/utils/storage/local';
@Component({
  selector: 'app-code-id-detail',
  templateUrl: './code-id-detail.component.html',
  styleUrls: ['./code-id-detail.component.scss'],
})
export class CodeIdDetailComponent implements OnInit {
  codeId;
  tabIndex = 0;
  isLoading = true;
  errTxt: string;
  TAB = [
    {
      id: 0,
      value: 'Contracts',
    },
    {
      id: 1,
      value: 'Verify Code ID',
    },
  ];
  codeIdDetail;
  lengthNormalAddress = LENGTH_CHARACTER.ADDRESS;

  constructor(
    private router: ActivatedRoute,
    private route: Router,
    private contractService: ContractService,
  ) {}

  ngOnInit(): void {
    this.codeId = this.router.snapshot.paramMap.get('codeId');
    if (local.getItem(STORAGE_KEYS.IS_VERIFY_TAB) == 'true') {
      this.tabIndex = 1;
      local.removeItem(STORAGE_KEYS.IS_VERIFY_TAB);
    }

    if (this.codeId === 'null') {
      this.route.navigate(['/']);
    } else {
      this.getCodeIdDetail();
    }
  }

  getCodeIdDetail() {
    this.contractService.getCodeIDDetail(this.codeId).subscribe({
      next: (res) => {
        if (res.code?.length > 0) {
          let data = res.code[0];
          data.instantiates = data.smart_contracts_aggregate?.aggregate?.count || 0;
          data.tx_hash = data.store_hash;
          data.verified_at = _.get(data, 'code_id_verifications[0].verified_at');
          data.contract_verification = _.get(data, 'code_id_verifications[0].verification_status');
          if (data.type === ContractRegisterType.CW721 && data.smart_contracts[0]?.name === TYPE_CW4973) {
            data.type = ContractRegisterType.CW4973;
          }
          this.codeIdDetail = data;
        }
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.status + ' ' + e.statusText;
        }
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
