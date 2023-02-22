import { Component, OnInit } from '@angular/core';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-code-id',
  templateUrl: './verify-code-id.component.html',
  styleUrls: ['./verify-code-id.component.scss'],
})
export class VerifyCodeIdComponent implements OnInit {
  contractVerifyType: any = ContractVerifyType.Unverified;
  isVerifying = false;
  contractAddress;
  contractDetail;
  constructor(private router: Router) {}

  ngOnInit(): void {}

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
