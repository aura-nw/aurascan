import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { interval, Subject, switchMap, takeUntil } from 'rxjs';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';

@Component({
  selector: 'app-evm-contracts-verify',
  templateUrl: './evm-contracts-verify.component.html',
  styleUrls: ['./evm-contracts-verify.component.scss'],
})
export class EvmContractsVerifyComponent implements OnInit, OnDestroy {
  currentStep: 'verify' | 'compiler' = 'verify';
  contractAddress = '';
  isCompilerComplete = false;
  loading = false;
  isVerifyFail = false;
  isVerifySuccess = false;
  formValid = false;

  contractSourceCode: File;

  inputFileValue = null;

  interupt$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private env: EnvironmentService,
    private contractService: ContractService,
    private toatr: NgxToastrService,
  ) {
    this.contractAddress = this.route.snapshot.paramMap.get('contractAddress');

    if (this.contractAddress.trim().length === 0) {
      this.router.navigate(['evm-contracts']);
    }
  }

  ngOnDestroy(): void {
    this.interupt$.next();
    this.interupt$.complete();
  }

  contractForm: UntypedFormGroup;

  get formControls() {
    return this.contractForm.controls;
  }

  ngOnInit(): void {
    this.contractForm = new UntypedFormGroup({
      address: new UntypedFormControl(
        { value: this.contractAddress, disabled: true },
        { validators: [Validators.required] },
      ),
    });
  }

  onSubmit() {
    this.verifyEvmContract();
  }

  checkStatusVerify() {
    this.contractService;
  }

  onFileDropped(files) {
    console.log('🐛 files: ', files);

    const file: File = files[0];

    const SUPPORTED_FILE_TYPE = ['application/x-zip-compressed', 'application/json'];

    const MAX_FILE_SIZE = 1024 * 1000;

    if (SUPPORTED_FILE_TYPE.includes(file?.type) && file?.size <= MAX_FILE_SIZE) {
      this.contractSourceCode = file;
      this.inputFileValue = null;
    }
  }

  verifyEvmContract() {
    if (!this.contractSourceCode) {
      return;
    }

    this.loading = true;

    const formdata: FormData = new FormData();

    formdata.append('file', this.contractSourceCode, this.contractSourceCode.name);
    formdata.append('contract_address', this.contractAddress.toLowerCase());
    formdata.append('chainid', this.env.chainId);

    this.contractService.verifyEvmContract(formdata).subscribe({
      next: (res) => {
        console.log('🐛 res: ', res);
        this.checkVerifyEvmContractStatus(res?.['id']);
      },
      error: (e) => {
        this.loading = false;

        console.log('🐛 e: ', e);
      },
    });
  }

  checkVerifyEvmContractStatus(id: number) {
    this.interupt$ = new Subject();
    interval(5000)
      .pipe(
        switchMap(() => {
          return this.contractService.checkVerifyEvmContractStatus(this.contractAddress, id);
        }),
        takeUntil(this.interupt$),
      )
      .subscribe({
        next: (result) => {
          console.log(result);
          if (result) {
            const status = _.get(result, 'evm_contract_verification[0].status');

            if (status != 'PENDING') {
              this.interupt$.next();

              if (status == 'SUCCESS') {
                this.router.navigate(['evm-contracts', this.contractAddress]);
              } else {
                this.toatr.error('Verify contract fail');
              }
            }
          }
        },
        error: () => {
          this.toatr.error('Verify contract fail');
          this.interupt$.next();
        },
        complete: () => {
          this.loading = false;
          this.interupt$.complete();
        },
      });
  }
}
