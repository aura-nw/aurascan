import { Component, OnInit } from '@angular/core';
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ContractService} from "../../../core/services/contract.service";

@Component({
  selector: 'app-contracts-verify',
  templateUrl: './contracts-verify.component.html',
  styleUrls: ['./contracts-verify.component.scss'],
})
export class ContractsVerifyComponent implements OnInit {
  tabCurrent = 1;
  contractAddress = 'aura1q6u4ajrfs9zv9gh9u8h88j24yujerk2d24rsjqutrzwqvhpqd3tsxsg4yz'
  constructor(
      private layout: BreakpointObserver,
      private contractService: ContractService,
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
  versionList = ['1.61.0','v1.1','v1.03','v2','v2.1.3']
  contractForm: FormGroup;
  ngOnInit(): void {
    this.contractForm = new FormGroup({
      contract_address: new FormControl(''),
      url: new FormControl('', [Validators.required, Validators.max(200)]),
      compiler_version: new FormControl('', [Validators.required]),
    })
    this.contractForm.patchValue({address: this.contractAddress});
  }
  changeTab(tabId): void {
    this.tabCurrent = tabId;
  }
  onSubmit() {
    if(this.contractForm.valid) {
      this.contractService.verifyContract(this.contractForm.value).subscribe(res => {
        this.contractForm.reset();
      })
    }
  }
}
