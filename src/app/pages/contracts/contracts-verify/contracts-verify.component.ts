import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CONTRACT_VERSIONS } from 'src/app/core/constants/contract.constant';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { IResponsesTemplates } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { WSService } from 'src/app/core/services/ws.service';

@Component({
  selector: 'app-contracts-verify',
  templateUrl: './contracts-verify.component.html',
  styleUrls: ['./contracts-verify.component.scss'],
})
export class ContractsVerifyComponent implements OnInit {
  contractAddress = '';
  currentStep: 'verify' | 'compiler' = 'verify';
  code_id = '';
  isCompilerComplete = false;
  loading = true;
  isExitCode = false;
  isVerifyFail = false;
  isVerifySuccess = false;

  @ViewChild('version') versionSelect: any;

  versionList = CONTRACT_VERSIONS;

  constructor(
    private contractService: ContractService,
    private route: ActivatedRoute,
    private router: Router,
    private wSService: WSService,
  ) {
    this.code_id = this.route.snapshot.paramMap.get('code_id');

    if (this.code_id.trim().length === 0) {
      this.router.navigate(['contracts']);
    }
  }

  githubCommitPattern = /https:\/\/github.com\/[\w-\/]+\/commit\/\w+/;
  contractForm: FormGroup;

  get formControls() {
    return this.contractForm.controls;
  }

  ngOnInit(): void {
    this.contractForm = new FormGroup(
      {
        codeId: new FormControl(
          { value: this.code_id, disabled: true },
          { validators: [Validators.required], updateOn: 'submit' },
        ),
        link: new FormControl('', {
          validators: [Validators.required, Validators.maxLength(200), Validators.pattern(this.githubCommitPattern)],
          updateOn: 'submit',
        }),
        wasm_file: new FormControl('', {
          validators: [Validators.required, Validators.maxLength(200)],
          updateOn: 'submit',
        }),
        url: new FormControl(''),
        compiler_version: new FormControl('', { validators: [Validators.required], updateOn: 'submit' }),
        commit: new FormControl(''),
      },
      {
        updateOn: 'submit',
      },
    );
    this.checkStatusVerify();
  }

  onSubmit() {
    this.formControls['link'].markAsTouched();
    this.formControls['compiler_version'].markAsTouched();
    this.formControls['wasm_file'].markAsTouched();

    if (this.contractForm.valid) {
      // handle contract_address & commit
      const link = this.contractForm.controls['link'].value;
      this.contractForm.controls['url'].setValue(link.substring(0, link.indexOf('/commit')));
      this.contractForm.controls['commit'].setValue(link.split('/')[link.split('/').length - 1]);
      const contractData = {
        code_id: this.contractForm.controls['codeId'].value,
        url: this.contractForm.controls['url'].value,
        compiler_version: this.contractForm.controls['compiler_version'].value,
        commit: this.contractForm.controls['commit'].value,
        wasm_file: this.contractForm.controls['wasm_file'].value,
      };

      this.contractService.verifyCodeID(contractData).subscribe((res: IResponsesTemplates<any>) => {
        const data = res?.data;
        if (data) {
          localStorage.setItem('startOver', 'false');
          switch (data?.Code) {
            case 'SUCCESSFUL':
              this.currentStep = 'compiler';
              this.startWS();
              break;
            default:
              break;
          }
        }
      });
    }
  }

  handleReset() {
    this.contractForm.reset({ contract_address: this.contractAddress });
    this.contractForm.controls['codeId'].setValue(this.code_id);
  }

  startOver(): void {
    localStorage.setItem('startOver', 'true');
    this.currentStep = 'verify';
    this.isCompilerComplete = false;
    this.isVerifyFail = false;
  }

  startWS(): void {
    this.wSService.subscribeVerifyContract(
      Number(this.code_id),
      () => {},
      () => {},
    );
  }

  checkStatusVerify() {
    this.contractService.checkVerified(this.code_id).subscribe((res) => {
      if (res.data) {
        this.loading = false;
        this.isExitCode = true;
        let startOver = localStorage.getItem('startOver');
        if (startOver && startOver == 'false') {
          this.currentStep = 'compiler';
          this.startWS();
          if (res.data.status.toLowerCase() == ContractVerifyType.VerifiedFail.toLowerCase()) {
            this.isCompilerComplete = true;
            this.isVerifyFail = true;
          }
        }
      }
    });
  }

  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll(event) {
    this.versionSelect.close();
  }

  redirectToPreviousPage() {
    const preUrl = sessionStorage.getItem('codeIdPrePage');
    if (preUrl) {
      window.location.href = preUrl;
    } else {
      this.router.navigate(['contracts']);
    }
  }
}
