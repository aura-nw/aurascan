import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';

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
    private commonService: CommonService) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.getDetail();
  }
  getDetail(): void {
    this.commonService
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
