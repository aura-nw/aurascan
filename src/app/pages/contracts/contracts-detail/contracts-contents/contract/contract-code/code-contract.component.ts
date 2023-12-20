import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { STORAGE_KEYS } from 'src/app/core/constants/common.constant';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { CommonService } from 'src/app/core/services/common.service';
import local from 'src/app/core/utils/storage/local';

@Component({
  selector: 'app-code-contract',
  templateUrl: './code-contract.component.html',
  styleUrls: ['./code-contract.component.scss'],
})
export class CodeContractComponent implements OnInit {
  @Input() contractDetailData: any;

  contractVerifyType = ContractVerifyType;
  isExpand = false;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  constructor(private router: Router, private layout: BreakpointObserver, public commonService: CommonService) {}

  ngOnInit(): void {}

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

  sendRouteObject(type: 'json' | 'text', content: string) {
    local.setItem(STORAGE_KEYS.CONTRACT_RAW_DATA, JSON.stringify({ content, type }));
    let url = this.router.serializeUrl(this.router.createUrlTree(['raw-data']));
    window.open(url, '_blank');
  }
}
