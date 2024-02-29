import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
})
export class TransactionComponent {
  hash$: Observable<{
    type: 'cosmos' | 'evm';
    hash: string;
  }> = this.route.paramMap.pipe(
    map((data) => {
      const hash = data.get('id');
      return {
        type: hash.startsWith('0x') ? 'evm' : 'cosmos',
        hash,
      };
    }),
  );

  constructor(private route: ActivatedRoute) {}
}
