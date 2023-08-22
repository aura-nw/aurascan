import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TABS_TITLE_ACCOUNT } from 'src/app/core/constants/account.constant';
import { TabsAccount } from 'src/app/core/constants/account.enum';

@Component({
  selector: 'app-account-transaction',
  templateUrl: './account-transaction.component.html',
  styleUrls: ['./account-transaction.component.scss'],
})
export class AccountTransactionComponent implements OnInit, AfterViewInit {
  // loading param check
  isNoData = false;

  destroyed$ = new Subject();
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(takeUntil(this.destroyed$));

  TABS = TABS_TITLE_ACCOUNT;
  tabsData = TabsAccount;
  currentTab = TabsAccount.ExecutedTxs;

  constructor(private layout: BreakpointObserver) {}

  ngAfterViewInit(): void {}

  ngOnInit(): void {}

  reloadData() {
    location.reload();
  }
}
