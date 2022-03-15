import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TableTemplate } from '../../../../app/core/models/common.model';
import { CommonService } from '../../../../app/core/services/common.service';
import { ValidatorService } from '../../../../app/core/services/validator.service';

@Component({
  selector: 'app-validators-detail',
  templateUrl: './validators-detail.component.html',
  styleUrls: ['./validators-detail.component.scss']
})
export class ValidatorsDetailComponent implements OnInit {
  id;
  item;
  breadCrumbItems = [
    { label: 'Validators' },
    { label: 'List', active: false },
    { label: 'Detail', active: true }
  ];

  @ViewChild(MatSort) sort: MatSort;
  templates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'validation_code', headerCellDef: 'Result' },
    { matColumnDef: 'abc', headerCellDef: 'Amount' },
    { matColumnDef: 'cde', headerCellDef: 'Fee' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' }
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any>;
  length;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [10, 25, 50, 100];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
    private validatorService: ValidatorService) {
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.getDetail();
  }
  getDetail(): void {
    this.validatorService
      .validatorsDetail(this.id)
      .subscribe(res => {
        if (res.status === 404) {
          this.router.navigate(['/']);
          return;
        }
        
        this.item = res.data;
        this.dataSource = new MatTableDataSource(res.data?.txs);
        this.length = res.data?.txs?.length;
        this.dataSource.sort = this.sort;
      },
        error => {
          this.router.navigate(['/']);
        }
      )
  }

  openTxsDetail(data) {
    this.router.navigate(['transaction', data.tx_hash]);
  }
}
