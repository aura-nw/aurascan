import { Component, Input, OnInit } from '@angular/core';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';

@Component({
  selector: 'app-code-contract',
  templateUrl: './code-contract.component.html',
  styleUrls: ['./code-contract.component.scss'],
})
export class CodeContractComponent implements OnInit {
  @Input() contractDetailData: any;

  contractVerifyType = ContractVerifyType;
  isExpand = false;
  constructor() {}

  ngOnInit(): void {
  }

  expandMenu(): void {
    for (let i = 0; i < document.getElementsByClassName('content-contract').length; i++) {
      let element: HTMLElement = document.getElementsByClassName('content-contract')[i] as HTMLElement;
      let expand = element.getAttribute('aria-expanded');
      if (expand === this.isExpand.toString()) {
        element.click();
      }
    }
    this.isExpand = !this.isExpand;
  }

  copyData(text: string): void {
    var dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
  }
}
