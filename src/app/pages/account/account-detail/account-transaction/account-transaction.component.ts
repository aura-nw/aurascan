import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TABS_TITLE_ACCOUNT, TABS_TITLE_ACCOUNT_EVM } from 'src/app/core/constants/account.constant';
import { TabsAccountLink } from 'src/app/core/constants/account.enum';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-account-transaction',
  templateUrl: './account-transaction.component.html',
  styleUrls: ['./account-transaction.component.scss'],
})
export class AccountTransactionComponent implements OnInit {
  @Input() address: string;

  destroyed$ = new Subject<void>();
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(takeUntil(this.destroyed$));

  TABS;
  tabsData = TabsAccountLink;
  currentTab = TabsAccountLink.ExecutedTxs;
  lstTypeFilter = [];

  constructor(
    private layout: BreakpointObserver,
    private route: ActivatedRoute,
    private location: Location,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params?.tab) {
        this.currentTab = params.tab;
      }
    });

    if (this.commonService.isNativeAddress(this.address)) {
      this.TABS = TABS_TITLE_ACCOUNT;
    } else {
      this.TABS = TABS_TITLE_ACCOUNT_EVM;
    }
  }

  changeTab(value) {
    this.location.replaceState('/account/' + this.address + '?tab=' + value);
    this.currentTab = value;
  }
}
