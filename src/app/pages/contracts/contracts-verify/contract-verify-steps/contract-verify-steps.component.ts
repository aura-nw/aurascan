import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IResponsesTemplates } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { WSService } from 'src/app/core/services/ws.service';

@Component({
  selector: 'app-contract-verify-steps',
  templateUrl: './contract-verify-steps.component.html',
  styleUrls: ['./contract-verify-steps.component.scss'],
})
export class ContractVerifyStepsComponent implements OnInit {
  @Input() codeID: any;
  @Output() isCompilerComplete = new EventEmitter<boolean>();
  @Output() isVerifyFail = new EventEmitter<boolean>();
  @Output() isVerifySuccess = new EventEmitter<boolean>();

  currentStep = 1;
  steps = [];
  currentCode = 0;

  constructor(private contractService: ContractService, private wSService: WSService) {
    this.wSService.getCodeStatus.subscribe((code) => {
      setTimeout(() => {
        this.getDataVerify();
        if (code.startsWith('E')) {
          this.isVerifyFail.emit(true);
          this.isCompilerComplete.emit(true);
        }

        if (this.currentStep >= 8) {
          this.isCompilerComplete.emit(true);
        }
      }, 500);
    });
  }

  ngOnInit(): void {
    this.currentCode = Number(this.codeID);
    this.getDataVerify();
  }

  getDataVerify() {
    this.contractService.getVerifyCodeStep(this.currentCode).subscribe((res: IResponsesTemplates<any>) => {
      this.steps = res?.data.map((dta) => ({
        ...dta,
        className: this.getClassName(dta.result),
      }));

      
      let stepTemp = this.steps.find((dta) => dta.result !== 'Success')?.check_id;
      if (stepTemp) {
        this.currentStep = stepTemp - 1 > 0 ? stepTemp - 1 : 0;
      } else {
        this.currentStep = 8;
        this.isVerifySuccess.emit(true);
      }
    });
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
