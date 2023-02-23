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
  @Input() codeId: string;
  contractStatus: any = ContractVerifyType.Unverified;
  contractVerifyType = ContractVerifyType;
  codeIdDetail;
  constructor(private contractService: ContractService, private router: Router) {}

  ngOnInit(): void {
    this.checkStatusVerify();
  }

  checkStatusVerify() {
    this.contractService.checkVerified(this.codeId).subscribe((res) => {
      if (res.data) {
        this.contractStatus = res.data.status;
        if (this.contractStatus === ContractVerifyType.Verified) {
          this.getCodeIdDetail();
        }
      }
    });
  }

  getCodeIdDetail() {
    this.contractService.getCodeIDDetail(Number(this.codeId)).subscribe((res) => {
      this.codeIdDetail = res.data;
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
    this.router.navigate(['/contracts/verify', codeId]);
  }
}
