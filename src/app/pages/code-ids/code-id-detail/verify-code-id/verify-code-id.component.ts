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
  @Input() codeId: any;
  loading = true;
  codeIdDetail: any;
  contractStatus: any = ContractVerifyType.Unverified;
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
    let linkVerify = this.router.url.includes('?tab=1') ? this.router.url : this.router.url + '?tab=1';
    sessionStorage.setItem('codeIdPrePage', linkVerify);
    this.router.navigate(['/contracts/verify', this.codeId]);
  }

  getCodeIdDetail() {
    this.contractService.getCodeIDDetail(this.codeId).subscribe((res) => {
      this.codeIdDetail = res.data;
      this.contractStatus = this.codeIdDetail?.contract_verification;
      this.loading = false;
    });
  }
}
