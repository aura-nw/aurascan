import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { WalletService } from 'src/app/core/services/wallet.service';

@Component({
  selector: 'app-fee-grant',
  templateUrl: './fee-grant.component.html',
  styleUrls: ['./fee-grant.component.scss'],
})
export class FeeGrantComponent implements OnInit {
  isGrantees = true;
  TAB = [
    {
      id: 0,
      value: 'My Grantees',
    },
    {
      id: 1,
      value: 'My Granters',
    },
  ];
  constructor(public walletService: WalletService, private router: Router) {}

  ngOnInit(): void {
    from([1])
      .pipe(
        delay(600),
        mergeMap((_) => this.walletService.wallet$),
      )
      .subscribe((wallet) => {
        if (!wallet) {
          this.router.navigate(['/']);
        }
      });
  }

  changeType(type: boolean) {
    this.isGrantees = type;
  }
}
