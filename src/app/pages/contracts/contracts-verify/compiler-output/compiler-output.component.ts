import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-compiler-output',
  templateUrl: './compiler-output.component.html',
  styleUrls: ['./compiler-output.component.scss']
})
export class CompilerOutputComponent implements OnInit {
  @Input() contractAddress: string = '';
  @Input() contractTxHash: string = '';
  @Input() compilerVersion: string = '';
  @Input() contractName: string = '';
  @Output() switchStage = new EventEmitter();
  logError = false;
  constructor() { }

  ngOnInit(): void {
  }

  switchErrStatus() {
    this.logError = !this.logError
  }

  switchStageEmmit() {
    this.switchStage.emit();
  }
}
