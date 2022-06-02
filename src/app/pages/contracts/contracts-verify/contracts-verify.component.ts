import { Component, OnInit } from '@angular/core';
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {validator} from "@cosmjs/stargate/build/testutils.spec";

@Component({
  selector: 'app-contracts-verify',
  templateUrl: './contracts-verify.component.html',
  styleUrls: ['./contracts-verify.component.scss'],
})
export class ContractsVerifyComponent implements OnInit {
  tabCurrent = 1;
  contractAddress = 'D6DA41500228CE6C3A545298CB44F45B3EB'
  constructor(
      private layout: BreakpointObserver
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
  versionList = ['v1','v1.1','v1.03','v2','v2.1.3']
  contractForm: FormGroup;
  ngOnInit(): void {
    this.contractForm = new FormGroup({
      address: new FormControl(''),
      link: new FormControl('', [Validators.required, Validators.max(200)]),
      version: new FormControl('', [Validators.required]),
    })
    this.contractForm.patchValue({address: this.contractAddress});
  }
  changeTab(tabId): void {
    this.tabCurrent = tabId;
    console.log(this.tabCurrent)
  }
  onSubmit() {
    console.log(this.contractForm.value)
  }
}
