import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ResponseDto } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';

@Component({
  selector: 'app-compiler-output',
  templateUrl: './compiler-output.component.html',
  styleUrls: ['./compiler-output.component.scss'],
})
export class CompilerOutputComponent implements OnInit {
  @Input() contractAddress: string = '';
  @Input() contractTxHash: string = '';
  @Input() compilerVersion: string = '';
  @Input() contractName: string = '';
  @Output() switchStage = new EventEmitter();
  logError = false;
  contractOutput: any;
  constructor(private contractService: ContractService) {}

  ngOnInit(): void {
    this.getContractDetail();
  }

  switchErrStatus() {
    this.logError = !this.logError;
  }

  switchStageEmit() {
    this.switchStage.emit();
  }

  getContractDetail() {
    this.contractService.getContractDetail(this.contractAddress).subscribe((res: ResponseDto) => {
      this.contractOutput = res?.data;
    });
  }
}
