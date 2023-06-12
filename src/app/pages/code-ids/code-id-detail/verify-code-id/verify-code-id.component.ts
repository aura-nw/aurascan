import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { ContractService } from 'src/app/core/services/contract.service';

@Component({
  selector: 'app-verify-code-id',
  templateUrl: './verify-code-id.component.html',
  styleUrls: ['./verify-code-id.component.scss'],
})
export class VerifyCodeIdComponent implements OnInit {
  @Input() codeId: any;
  loading = true;
  codeIdDetail: any;
  contractVerifyType = ContractVerifyType;

  constructor(private contractService: ContractService, private router: Router) {}

  ngOnInit(): void {
    this.getCodeIdDetail();
  }

  copyData(text: string): void {
    var dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    // fake event click out side copy button
    // this event for hidden tooltip
    setTimeout(function () {
      document.getElementById('popupCopy').click();
    }, 800);
  }

  navigateToVerify() {
    sessionStorage.setItem('codeIdPrePage', this.router.url);
    this.router.navigate(['/code-ids/verify', this.codeId]);
  }

  getCodeIdDetail() {
    this.contractService.getCodeIDDetail(this.codeId).subscribe(
      (res) => {
        if (res.data?.length > 0) {
          let data = res.data[0];
          data.compiler_version = _.get(data, 'code_id_verifications[0].compiler_version');
          data.verified_at = _.get(data, 'code_id_verifications[0].verified_at');
          data.contract_verification = _.get(data, 'code_id_verifications[0].verification_status');
          data.url = _.get(data, 'code_id_verifications[0].github_url');

          this.codeIdDetail = data;
        }
      },
      () => {},
      () => {
        this.loading = false;
      },
    );
  }
}
