import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-compiler-output',
  templateUrl: './compiler-output.component.html',
  styleUrls: ['./compiler-output.component.scss']
})
export class CompilerOutputComponent implements OnInit {
  @Input() contractAddress: string = '';
  logError = false;
  constructor() { }

  ngOnInit(): void {
  }

}
