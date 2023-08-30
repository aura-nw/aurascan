import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TABS_TITLE_ACCOUNT } from 'src/app/core/constants/account.constant';
import { TabsAccountLink } from 'src/app/core/constants/account.enum';

@Component({
  selector: 'app-account-transaction',
  templateUrl: './account-transaction.component.html',
  styleUrls: ['./account-transaction.component.scss'],
})
export class AccountTransactionComponent implements OnInit {
  @Input() address: string;

  isNoData = false;
  destroyed$ = new Subject();
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(takeUntil(this.destroyed$));

  TABS = TABS_TITLE_ACCOUNT;
  tabsData = TabsAccountLink;
  currentTab = TabsAccountLink.ExecutedTxs;

  constructor(private layout: BreakpointObserver, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params?.tab) {
        this.currentTab = params.tab;
      }
    });
  }

  reloadData() {
    location.reload();
  }
}
