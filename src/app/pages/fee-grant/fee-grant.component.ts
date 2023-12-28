import {Component, OnInit} from '@angular/core';
import {from} from 'rxjs';
import {delay, mergeMap} from 'rxjs/operators';
import {WalletService} from 'src/app/core/services/wallet.service';

@Component({
  selector: 'app-fee-grant',
  templateUrl: './fee-grant.component.html',
  styleUrls: ['./fee-grant.component.scss'],
})
export class FeeGrantComponent implements OnInit {
  isGrantees = true;
  currentAddress = null;
  isLoading = true;
  TAB = [
    {
      id: 0,
      value: 'PAGES.FEE_GRANT.myGrantees',
    },
    {
      id: 1,
      value: 'PAGES.FEE_GRANT.myGrantees',
    },
  ];

  constructor(private walletService: WalletService) {
  }

  ngOnInit(): void {
    from([1])
      .pipe(
        delay(600),
        mergeMap((_) => this.walletService.wallet$),
      )
      .subscribe((wallet) => {
        if (wallet) {
          this.currentAddress = wallet.bech32Address;
        } else {
          this.currentAddress = null;
        }
        this.isLoading = false;
      });
  }

  changeType(type: boolean) {
    this.isGrantees = type;
  }
}
