import {Component, ElementRef, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgxToastrService} from "src/app/core/services/ngx-toastr.service";
import {EnvironmentService} from "src/app/core/data-services/environment.service";

@Component({
  selector: 'app-popup-add-grant',
  templateUrl: './popup-add-grant.component.html',
  styleUrls: ['./popup-add-grant.component.scss']
})
export class PopupAddGrantComponent implements OnInit {
  grantForm;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  periodShow = false;
  contractType: 'instantiate' | 'execute' = 'instantiate';
  allContractAllowActive = true;
  currDate;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { data: any },
    public dialogRef: MatDialogRef<PopupAddGrantComponent>,
    private fb: FormBuilder,
    private toastr: NgxToastrService,
    public environmentService: EnvironmentService
  ) {}

  ngOnInit(): void {
    this.formInit();
    this.initLayout();
  }

  initLayout() {
    // override cdk-overlay-container z-index
    const overlay = document.getElementsByClassName('cdk-overlay-container');
    if(overlay) {
      overlay[0].classList.add('cdk-overlay-container--grant');
    }
    // validator min date
    this.currDate = new Date();
  }

  formInit() {
    this.grantForm = this.fb.group(
      {
        grantee_address: ['', [Validators.required]],
        amount: ['', [Validators.maxLength(200)]],
        expiration_time: [''],
        period_amount: [''],
        period_day: [''],
        execute_contract: this.fb.array([])
      }
    );
    this.addContracts();
  }

  get contracts(): FormArray {
    return this.grantForm.get("execute_contract") as FormArray
  }

  newContract(): FormGroup {
    return this.fb.group({
      address: ['', { validators: [Validators.required]}]
    })
  }


  addContracts() {
    this.contracts.push(this.newContract());
  }

  removeContract(i:number) {
    this.contracts.removeAt(i);
  }

  getMaxToken(controlName: string) {
    this.grantForm.controls[controlName].setValue(1000000)
  }

  closeDialog() {
    this.dialogRef.close('');
  }

  changePeriodStage(stage: boolean) {
    this.periodShow = stage;
  }

  changeContractStage(contract: 'instantiate' | 'execute') {
    this.contractType = contract;
  }

  changeContractsActive(isAll: boolean) {
    this.allContractAllowActive = isAll;
  }

  onSubmit() {

  }

  addClassFocus(e: HTMLInputElement) {
    e.parentElement.classList.add('border-white');
  }

  removeClassFocus(e: HTMLInputElement) {
    e.parentElement.classList.remove('border-white');
  }

}
