import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-token-contract-write',
  templateUrl: './token-contract-write.component.html',
  styleUrls: ['./token-contract-write.component.scss']
})
export class TokenContractWriteComponent implements OnInit {
  isExpand = false;
  constructor() { }

  ngOnInit(): void {
  }

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
