import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {CONTRACT_VERSIONS} from "src/app/core/constants/contract.constant";
import {ActivatedRoute, Router} from "@angular/router";
import {WSService} from "src/app/core/services/ws.service";
import {UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import local from "src/app/core/utils/storage/local";
import {STORAGE_KEYS} from "src/app/core/constants/common.constant";

@Component({
  selector: 'app-evm-contracts-verify',
  templateUrl: './evm-contracts-verify.component.html',
  styleUrls: ['./evm-contracts-verify.component.scss']
})
export class EvmContractsVerifyComponent implements OnInit {
  contractAddress = '';
  currentStep: 'verify' | 'compiler' = 'verify';
  address = '';
  isCompilerComplete = false;
  loading = false;
  isExitCode = true;
  isVerifyFail = false;
  isVerifySuccess = false;
  formValid = false;

  @ViewChild('type') typeSelect: any;
  @ViewChild('version') versionSelect: any;
  @ViewChild('license') licenseSelect: any;

  versionList = CONTRACT_VERSIONS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private wSService: WSService,
  ) {
    this.address = this.route.snapshot.paramMap.get('contractAddress');

    if (this.address.trim().length === 0) {
      this.router.navigate(['evm-contracts']);
    }
  }

  contractForm: UntypedFormGroup;

  get formControls() {
    return this.contractForm.controls;
  }

  ngOnInit(): void {
    this.contractForm = new UntypedFormGroup({
      address: new UntypedFormControl({value: this.address, disabled: true}, {validators: [Validators.required]}),
      compiler_type: new UntypedFormControl('', {validators: [Validators.required]}),
      compiler_version: new UntypedFormControl('', {validators: [Validators.required]}),
      license: new UntypedFormControl('', {validators: [Validators.required]}),
    });
    // this.checkStatusVerify();
  }

  onSubmit() {
  }

  handleReset() {
    this.contractForm.reset({contract_address: this.contractAddress});
    this.contractForm.controls['address'].setValue(this.address);
  }

  startOver(): void {
    this.currentStep = 'verify';
    this.isCompilerComplete = false;
    this.isVerifyFail = false;
  }

  // startWS(): void {
  //   this.wSService.subscribeVerifyContract(
  //     Number(this.code_id),
  //     () => {
  //     },
  //     () => {
  //     },
  //   );
  // }

  checkStatusVerify() {
  }

  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll(event) {
    this.versionSelect.close();
    this.typeSelect.close();
    this.licenseSelect.close();
  }

  redirectToPreviousPage() {
    const preUrl = sessionStorage.getItem('codeIdPrePage');
    local.setItem(STORAGE_KEYS.IS_VERIFY_TAB, 'true');
    if (preUrl) {
      window.location.href = preUrl;
    } else {
      this.router.navigate(['contracts']);
    }
  }

  checkFormValid(): boolean {
    this.formValid = this.contractForm.status === "INVALID";
    return this.formValid;
  }
}