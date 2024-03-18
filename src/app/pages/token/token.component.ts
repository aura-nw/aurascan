import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';
import { EWalletType } from 'src/app/core/constants/wallet.constant';

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss'],
})
export class TokenComponent {
  hash$: Observable<{
    type: 'cosmos' | 'evm';
    hash: string;
  }> = this.route.paramMap.pipe(
    map((data) => {
      const hash = data.get('id');
      return {
        type: hash.startsWith(EWalletType.EVM) ? 'evm' : 'cosmos',
        hash,
      };
    }),
  );

  constructor(private route: ActivatedRoute) {}
}
