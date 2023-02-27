import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { ContractService } from 'src/app/core/services/contract.service';

@Component({
  selector: 'app-verify-code-id',
  templateUrl: './verify-code-id.component.html',
  styleUrls: ['./verify-code-id.component.scss'],
})
export class VerifyCodeIdComponent implements OnInit {
  @Input() codeIdDetail: any;
  loading = true;
  contractStatus: any = ContractVerifyType.Unverified;
  contractVerifyType = ContractVerifyType;
  constructor(private contractService: ContractService, private router: Router) {}

  ngOnInit(): void {
    this.checkStatusVerify();
  }

  checkStatusVerify() {
    this.contractService.checkVerified(this.codeIdDetail.code_id).subscribe((res) => {
      if (res.data) {
        this.contractStatus = res.data.status;
        this.loading = false;
        if (this.contractStatus === ContractVerifyType.Verified) {
        }
      }
    });
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

  navigateToVerify(codeId: string) {
    sessionStorage.setItem('codeIdPrePage', this.router.url);
    this.router.navigate(['/contracts/verify', this.codeIdDetail.code_id]);
  }
}
