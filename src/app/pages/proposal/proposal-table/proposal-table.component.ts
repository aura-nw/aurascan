import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { TableTemplate } from "src/app/core/models/common.model";

@Component({
  selector: "app-proposal-table",
  templateUrl: "./proposal-table.component.html",
  styleUrls: ["./proposal-table.component.scss"],
})
export class ProposalTableComponent implements OnInit {
  @Input() type: "VOTES" | "VALIDATORS_VOTES" | "DEPOSITORS";

  @ViewChild(MatSort) sort: MatSort;
  votesTemplates: Array<TableTemplate> = [
    { matColumnDef: "rank", headerCellDef: "Rank" },
    { matColumnDef: "validator", headerCellDef: "Validator" },
    { matColumnDef: "txHash", headerCellDef: "TxHash" },
    { matColumnDef: "answer", headerCellDef: "Answer" },
    { matColumnDef: "time", headerCellDef: "Time" },
  ];

  vTemplates: Array<TableTemplate> = [
    { matColumnDef: "rank", headerCellDef: "Rank" },
    { matColumnDef: "validator", headerCellDef: "Validator" },
    { matColumnDef: "txHash", headerCellDef: "TxHash" },
    { matColumnDef: "answer", headerCellDef: "Answer" },
    { matColumnDef: "time", headerCellDef: "Time" },
  ];

  dTemplates: Array<TableTemplate> = [
    { matColumnDef: "rank", headerCellDef: "Rank" },
    { matColumnDef: "validator", headerCellDef: "Validator" },
    { matColumnDef: "txHash", headerCellDef: "TxHash" },
    { matColumnDef: "answer", headerCellDef: "Answer" },
    { matColumnDef: "time", headerCellDef: "Time" },
  ];

  displayedColumns: string[] = this.votesTemplates.map(
    (dta) => dta.matColumnDef
  );

  dataSource: MatTableDataSource<any>;
  length;
  pageSize = 20;
  pageIndex = 0;

  constructor() {}

  ngOnInit(): void {}

  openBlockDetail(e, row): void {}
}
