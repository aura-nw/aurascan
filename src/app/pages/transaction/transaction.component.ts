import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
})
export class TransactionComponent {
  hash$ = this.route.paramMap.pipe(map((data) => data.get('id')));

  constructor(private route: ActivatedRoute) {}
}
