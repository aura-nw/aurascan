import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { from } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { WalletService } from 'src/app/core/services/wallet.service';
import { Router } from '@angular/router';
import { DeployContractListReq } from 'src/app/core/models/contract.model';

@Component({
  selector: 'app-contracts-deploy-mainnet',
  templateUrl: './contracts-deploy-mainnet.component.html',
  styleUrls: ['./contracts-deploy-mainnet.component.scss']
})
export class ContractsDeployMainnetComponent implements OnInit {
  submitting = false;
  userAddress;
  contractForm;
  emailPattern = /\S+@\S+\.\S+/;
  websitePattern = /(https:\/\/)[\w\d]+\.\w+\/?.+/;
  listID = []

  constructor(
    private fb: FormBuilder,
    private toastr: NgxToastrService,
    private contractService: ContractService,
    public translate: TranslateService,
    private walletService: WalletService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    from([1])
      .pipe(
        delay(800),
        mergeMap((_) => this.walletService.wallet$),
      )
      .subscribe(async (wallet) => {
        if (!wallet) {
          this.userAddress = null;
          this.router.navigate(['/']);
        } else {
          this.formInit();
          this.userAddress = wallet.bech32Address;
          await this.getCodeID(this.userAddress)
        }
      });
  }

  formInit() {
    this.contractForm = this.fb.group(
      {
        code_ids: ['', [Validators.required]],
        project_name: ['', [Validators.maxLength(200)]],
        official_project_website: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(this.websitePattern)]],
        official_project_email: ['', [Validators.required, Validators.maxLength(200), Validators.pattern(this.emailPattern)]],
        name: ['', [Validators.required, Validators.maxLength(200)]],
        email: ['', [Validators.required, Validators.maxLength(200), Validators.pattern(this.emailPattern)]],
        contract_description: ['', [Validators.required, Validators.maxLength(300)]],
        whitepaper: ['', [Validators.pattern(this.websitePattern)]],
        github: ['', [Validators.pattern(this.websitePattern)]],
        telegram: ['', [Validators.pattern(this.websitePattern)]],
        weChat: ['', [Validators.pattern(this.websitePattern)]],
        linkedin: ['', [Validators.pattern(this.websitePattern)]],
        discord: ['', [Validators.pattern(this.websitePattern)]],
        facebook: ['', [Validators.pattern(this.websitePattern)]],
        twitter: ['', [Validators.pattern(this.websitePattern)]],
        medium: ['', [Validators.pattern(this.websitePattern)]],
        reddit: ['', [Validators.pattern(this.websitePattern)]],
        slack: ['', [Validators.pattern(this.websitePattern)]],
        bit_coin_talk: ['', [Validators.pattern(this.websitePattern)]],
        agree: [false]
      }
    );
  }

  async getCodeID(user: string) {
    const req = await this.contractService.getContractIdList(user);
    if (req && req.data) {
      this.listID = req.data['data'];
    } else {
      this.listID.push('- No Data -');
    }
  }

  onSubmit() {
    if (this.contractForm.valid) {
      this.submitting = true;
      // Do action
      const dataDeploy: DeployContractListReq = {
        requester_address: this.userAddress,
        code_ids: this.contractForm.controls['code_ids'].value,
        project_name: this.contractForm.controls['project_name'].value,
        official_project_website: this.contractForm.controls['official_project_website'].value,
        official_project_email: this.contractForm.controls['official_project_email'].value,
        name: this.contractForm.controls['name'].value,
        email: this.contractForm.controls['email'].value,
        contract_description: this.contractForm.controls['contract_description'].value,
        whitepaper: this.contractForm.controls['whitepaper'].value,
        github: this.contractForm.controls['github'].value,
        telegram: this.contractForm.controls['telegram'].value,
        discord: this.contractForm.controls['discord'].value,
        facebook: this.contractForm.controls['facebook'].value,
        twitter: this.contractForm.controls['twitter'].value,
        wechat: this.contractForm.controls['weChat'].value,
        medium: this.contractForm.controls['medium'].value,
        reddit: this.contractForm.controls['reddit'].value,
        slack: this.contractForm.controls['slack'].value,
        linkedin: this.contractForm.controls['linkedin'].value,
        bitcointalk: this.contractForm.controls['bit_coin_talk'].value,
        project_sector: ''
      }
      this.contractService.createContractRequest(dataDeploy).subscribe(res => {
        if (res) {
          if (res.code === 200) {
            this.toastr.success(this.translate.instant('NOTICE.SUBMIT_FORM_SUCCESS'));
            this.contractForm.reset();
            this.router.navigate(['/contracts/smart-contract-list']);
          } else {
            this.toastr.error(res.message)
          }
        }
      });
      this.submitting = false;
    }
  }
}
