import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';

@Component({
  selector: 'app-contracts-deploy-mainnet',
  templateUrl: './contracts-deploy-mainnet.component.html',
  styleUrls: ['./contracts-deploy-mainnet.component.scss']
})
export class ContractsDeployMainnetComponent implements OnInit {  
  contractForm;
  websitePattern = /https:\/\/w+/;
  constructor(
    private fb: FormBuilder,
    private toastr: NgxToastrService,
    public translate: TranslateService,
    ) { }

  ngOnInit(): void {
    this.contractForm = this.fb.group (
      {
        code_id: ['', [Validators.required]],
        project_name: ['', [Validators.required, Validators.maxLength(200)]],
        official_project_website: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(this.websitePattern)]],
        official_project_email_address: ['', [Validators.required, Validators.maxLength(200)]],
        requester_name: ['', [Validators.required, Validators.maxLength(200)]],
        requester_email_address: ['', [Validators.required, Validators.maxLength(200)]],
        project_description: ['', [Validators.required, Validators.maxLength(300)]],
        whitepaper: ['', [Validators.pattern(this.websitePattern)]],
        github: ['', [Validators.pattern(this.websitePattern)]],
        telegram: ['', [Validators.pattern(this.websitePattern)]],
        weChat: ['', [Validators.pattern(this.websitePattern)]],
        linkedin: ['', [Validators.pattern(this.websitePattern)]],
        discord: ['', [Validators.pattern(this.websitePattern)]],
        medium: ['', [Validators.pattern(this.websitePattern)]],
        reddit: ['', [Validators.pattern(this.websitePattern)]],
        slack: ['', [Validators.pattern(this.websitePattern)]],
        facebook: ['', [Validators.pattern(this.websitePattern)]],
        twitter: ['', [Validators.pattern(this.websitePattern)]],
        bit_coin_talk: ['', [Validators.pattern(this.websitePattern)]]
      }
    );
  }
  onSubmit() {
    console.log(this.contractForm.value);
    
    if (this.contractForm.valid) {
      // Do action
        this.toastr.success(this.translate.instant('NOTICE.SUBMIT_FORM_SUCCESS'));
    }
  }

}
