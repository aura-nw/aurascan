import { Component, Input, OnInit } from '@angular/core';
import { IResponsesTemplates } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';

@Component({
  selector: 'app-contract-verify-steps',
  templateUrl: './contract-verify-steps.component.html',
  styleUrls: ['./contract-verify-steps.component.scss'],
})
export class ContractVerifyStepsComponent implements OnInit {
  @Input() codeID: any;
  currentStep = 1;
  steps = [];

  constructor(private contractService: ContractService) {}

  ngOnInit(): void {
    this.contractService.getVerifyCodeStep(Number(this.codeID)).subscribe((res: IResponsesTemplates<any>) => {
      this.steps = res?.data.map((dta) => ({
        ...dta,
        className: this.getClassName(dta.result),
      }));
      this.currentStep = this.steps.find((dta) => dta.result !== 'Success')?.check_id || 0;
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
