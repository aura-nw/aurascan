import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mergeMap } from 'rxjs/operators';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { ContractType } from 'src/app/core/constants/token.enum';
import { ContractService } from 'src/app/core/services/contract.service';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss'],
})
export class ContractComponent implements OnInit {
  @Input() contractTypeData: string;
  @Input() contractsAddress: string;

  contractType = ContractType;
  countCurrent = this.contractType.Code;
  contractVerifyType = ContractVerifyType;
  contractAddress: string;
  contractDetail: any;
  isVerifying = false;

  constructor(private contractService: ContractService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.contractAddress = this.route.snapshot.paramMap.get('contractAddress');
    this.getContractDetail();
  }

  getContractDetail(notCheck = false) {
    this.contractService.contractObservable
      .pipe(
        mergeMap((data) => {
          if (data) {
            this.contractDetail = data;
          }
          if (data?.code?.code_id_verifications[0]?.verification_status === 'verifying' && !notCheck) {
            this.isVerifying = true;
          } else {
            this.isVerifying = false;
          }

          return this.contractService.checkVerified(this.contractDetail.code_id);
        }),
      )
      .subscribe(({ data }) => {
        this.contractTypeData = data.status || this.contractTypeData;
        if (data?.status === 'verifying' && !notCheck) {
          this.isVerifying = true;
        } else {
          this.isVerifying = false;
        }
      });
  }

  changeTab(tabId): void {
    this.countCurrent = tabId;
  }

  navigateToVerify(codeId: string) {
    sessionStorage.setItem('codeIdPrePage', this.router.url);
    this.router.navigate(['/code-ids/verify', codeId]);
  }
}
