import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-contract-code',
  templateUrl: './contract-code.component.html',
  styleUrls: ['./contract-code.component.scss'],
})
export class ContractCodeComponent implements OnInit {
  isExpand = false;
  constructor() {}

  ngOnInit(): void {}

  expandMenu(): void {
    for(let i = 0; i < document.getElementsByClassName('content-contract').length; i++) {
      let element: HTMLElement = document.getElementsByClassName('content-contract')[i] as HTMLElement;
      let expand = element.getAttribute('aria-expanded');
      if (expand === this.isExpand.toString()) {
        element.click();
      }
    }
    this.isExpand = !this.isExpand;
  }
}
