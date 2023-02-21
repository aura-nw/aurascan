import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CONTRACT_VERSIONS } from 'src/app/core/constants/contract.constant';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { IResponsesTemplates } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
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
  @ViewChild('version') versionSelect: any;

  versionList = CONTRACT_VERSIONS;

  constructor(
    private contractService: ContractService,
    private route: ActivatedRoute,
    private router: Router,
    private wSService: WSService,
    private toastr: NgxToastrService,
  ) {
    this.contractAddress = this.route.snapshot.paramMap.get('addressId');
    this.code_id = this.route.snapshot.paramMap.get('code_id');

    if (this.contractAddress.trim().length === 0 || this.code_id.trim().length === 0) {
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
        contract_address: new FormControl(
          { value: this.contractAddress, disabled: true },
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
    this.getContractDetail();
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
        contract_address: this.contractForm.controls['contract_address'].value,
        url: this.contractForm.controls['url'].value,
        compiler_version: this.contractForm.controls['compiler_version'].value,
        commit: this.contractForm.controls['commit'].value,
        wasm_file: this.contractForm.controls['wasm_file'].value,
      };

      this.contractService.verifyCodeID(contractData).subscribe((res: IResponsesTemplates<any>) => {
        const data = res?.data;
        if (data) {
          switch (data?.Code) {
            case 'SUCCESSFUL':
              this.currentStep = 'compiler';

              //this.dlgServiceOpen();
              // this.wSService.subscribeVerifyContract(
              //   Number(this.code_id),
              //   () => {
              //     this.contractService.loadContractDetail(contractData.contract_address);
              //   },
              //   () => {
              //     this.router.navigate(['contracts', this.contractAddress], {
              //       queryParams: {
              //         tabId: 'contract',
              //       },
              //       state: {
              //         reload: true,
              //       },
              //     });
              //   },
              // );
              break;
            default:
              this.toastr.error(data?.Message);
              break;
          }
        }
      });
    }
  }

  // dlgServiceOpen(): void {
  //   this.dlgService.showDialog({
  //     content:
  //       'Contract Source Code Verification is pending!<br>We will notify the compiler output after verification is successful.',
  //     title: '',
  //     callback: (e) => {
  //       if (e) {
  //         this.router.navigate(['contracts', this.contractAddress], {
  //           queryParams: {
  //             tabId: 'contract',
  //           },
  //           state: {
  //             reload: true,
  //           },
  //         });
  //       } else {
  //         this.handleReset();
  //       }
  //     },
  //   });
  // }

  handleReset() {
    this.contractForm.reset({ contract_address: this.contractAddress });
  }

  getContractDetail() {
    this.contractService.getContractDetail(this.contractAddress).subscribe((res) => {
      if (res.data) {
        if (res.data.contract_verification.toLowerCase() == ContractVerifyType.Unverified.toLowerCase()) {
          this.currentStep = 'verify';
        } else {
          this.currentStep = 'compiler';
        }
      }
    });
  }

  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll(event) {
    this.versionSelect.close();
  }
}
