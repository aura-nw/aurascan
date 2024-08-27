import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';

@Component({
  selector: 'app-evm-internal-transactions',
  templateUrl: './evm-internal-transactions.component.html',
  styleUrls: ['./evm-internal-transactions.component.scss'],
})
export class EvmInternalTransactionsComponent implements OnInit {
  @Input() dataTable = [];
  isLoadingTx = true;

  templatesTx: Array<TableTemplate> = [
    { matColumnDef: 'type_trace_address', headerCellDef: 'Type Trace Address', headerWidth: 500 },
    { matColumnDef: 'from', headerCellDef: 'From', headerWidth: 220 },
    { matColumnDef: 'to', headerCellDef: 'To', headerWidth: 220 },
    { matColumnDef: 'value', headerCellDef: 'Value', headerWidth: 150 },
    { matColumnDef: 'gas_used', headerCellDef: 'Gas', headerWidth: 90 },
  ];
  displayedColumnsTx: string[] = this.templatesTx.map((dta) => dta.matColumnDef);
  dataSourceTx: MatTableDataSource<any> = new MatTableDataSource();
  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  decimal = 18;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  constructor(
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    this.dataSourceTx.data = this.dataTable;
    this.isLoadingTx = false;
  }
}
