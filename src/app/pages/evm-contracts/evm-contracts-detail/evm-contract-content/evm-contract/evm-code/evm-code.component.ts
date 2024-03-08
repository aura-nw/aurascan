import {Component, Input, OnInit} from '@angular/core';
import {ContractVerifyType} from "src/app/core/constants/contract.enum";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {Router} from "@angular/router";
import {CommonService} from "src/app/core/services/common.service";
import local from "src/app/core/utils/storage/local";
import {STORAGE_KEYS} from "src/app/core/constants/common.constant";

@Component({
  selector: 'app-evm-code',
  templateUrl: './evm-code.component.html',
  styleUrls: ['./evm-code.component.scss']
})
export class EvmCodeComponent implements OnInit {
  @Input() contractDetailData: any;

  contractVerifyType = ContractVerifyType;
  isExpand = false;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  constructor(private router: Router, private layout: BreakpointObserver, public commonService: CommonService) {
  }

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

  sendRouteObject(type: 'json' | 'text', content: string) {
    local.setItem(STORAGE_KEYS.CONTRACT_RAW_DATA, {content, type});
    let url = this.router.serializeUrl(this.router.createUrlTree(['raw-data']));
    window.open(url, '_blank');
  }
}