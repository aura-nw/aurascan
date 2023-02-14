import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contract-verify-steps',
  templateUrl: './contract-verify-steps.component.html',
  styleUrls: ['./contract-verify-steps.component.scss'],
})
export class ContractVerifyStepsComponent implements OnInit {
  currentStep = 2;

  constructor() {}

  ngOnInit(): void {}
}
