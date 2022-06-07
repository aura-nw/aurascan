import { Component, OnInit } from '@angular/core';
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ContractService} from "../../../core/services/contract.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-contracts-verify',
  templateUrl: './contracts-verify.component.html',
  styleUrls: ['./contracts-verify.component.scss'],
})
export class ContractsVerifyComponent implements OnInit {
  tabCurrent = 1;
  contractAddress = '';
  constructor(
      private layout: BreakpointObserver,
      private contractService: ContractService,
      private route: ActivatedRoute,
  ) {}
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  TAB = [
    {
      id: 1,
      value: 'Contract Source Code'
    },
    {
      id: 2,
      value: 'Compiler Output'
    }
  ]
  versionList = [
    {
      label: 'cargo 1.61.0',
      value: 'cargo 1.61.0 (a028ae4 2022-04-29)'
    }
  ]
  contractForm: FormGroup;
  ngOnInit(): void {
    this.contractAddress = this.route.snapshot.paramMap.get('addressId');
    this.contractForm = new FormGroup({
      contract_address: new FormControl('',[Validators.required]),
      link: new FormControl('', [Validators.required, Validators.maxLength(200)]),
      url: new FormControl(''),
      compiler_version: new FormControl('', [Validators.required]),
      commit: new FormControl(''),
    })
    this.contractForm.patchValue({contract_address: this.contractAddress});
  }
  changeTab(tabId): void {
    this.tabCurrent = tabId;
  }
  onSubmit() {
    if(this.contractForm.valid) {
      // handle contract_address & commit
      const link = this.contractForm.controls['link'].value;
      this.contractForm.controls['url'].setValue(link.substring(0, link.indexOf('/commit')));
      this.contractForm.controls['commit'].setValue(link.split('/')[link.split('/').length - 1]);
      const contractData = {
        contract_address: this.contractForm.controls['contract_address'].value,
        url:  this.contractForm.controls['url'].value,
        compiler_version:  this.contractForm.controls['compiler_version'].value,
        commit:  this.contractForm.controls['commit'].value,
      }
      // console.log(this.contractForm.value)
      this.contractService.verifyContract(contractData).subscribe(res => {
        // console.log(res)
        this.contractForm.reset();
      })
    }
  }
}
