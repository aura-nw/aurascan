import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ContractService} from "src/app/core/services/contract.service";
import {WSService} from "src/app/core/services/ws.service";
import {IResponsesTemplates} from "src/app/core/models/common.model";

@Component({
  selector: 'app-evm-contract-verify-steps',
  templateUrl: './evm-contract-verify-steps.component.html',
  styleUrls: ['./evm-contract-verify-steps.component.scss']
})
export class EvmContractVerifyStepsComponent implements OnInit {
  @Input() codeID: any;
  @Output() isCompilerComplete = new EventEmitter<boolean>();
  @Output() isVerifyFail = new EventEmitter<boolean>();
  @Output() isVerifySuccess = new EventEmitter<boolean>();
  errorMessage = null;

  currentStep = 0;
  steps = [];
  currentCode = 0;

  constructor() {
  }

  ngOnInit(): void {
  }

  getClassName(result) {
    switch (result) {
      case 'Pending':
        return 'waiting';
      case 'In-progress':
        return 'isProcessing';
      case 'Fail':
        return 'isError';
      default:
        return 'isComplete';
    }
  }
}
