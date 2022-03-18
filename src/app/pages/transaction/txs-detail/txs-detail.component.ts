import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from '../../../../app/core/services/transaction.service';

@Component({
  selector: 'app-txs-detail',
  templateUrl: './txs-detail.component.html',
  styleUrls: ['./txs-detail.component.scss']
})
export class TxsDetailComponent implements OnInit {
  id;
  item;
  breadCrumbItems = [
    { label: 'Transaction' },
    { label: 'List' },
    { label: 'Detail', active: true }
  ];

  constructor(private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.getDetail();
  }
  getDetail(): void {
    this.transactionService
      .txsDetail(this.id)
      .subscribe(res => {
        this.item = res.data;
      },
      error => {
        this.router.navigate(['/']);
      }
      );
  }
}
