import { Component, OnInit } from '@angular/core';
import {PageEvent} from "@angular/material/paginator";
import {PAGE_EVENT} from "src/app/core/constants/common.constant";
import {MAX_LENGTH_SEARCH_TOKEN} from "src/app/core/constants/token.constant";
import {MatTableDataSource} from "@angular/material/table";
import {TableTemplate} from "src/app/core/models/common.model";

@Component({
  selector: 'app-token-soulbound-contract-list',
  templateUrl: './token-soulbound-contract-list.component.html',
  styleUrls: ['./token-soulbound-contract-list.component.scss']
})
export class TokenSoulboundContractListComponent implements OnInit {

  textSearch = '';
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'id' },
    { matColumnDef: 'address', headerCellDef: 'address' },
    { matColumnDef: 'createData', headerCellDef: 'createData' },
    { matColumnDef: 'claimedQTY', headerCellDef: 'claimedQTY' },
    { matColumnDef: 'unclaimedQTY', headerCellDef: 'unclaimedQTY' },
    { matColumnDef: 'action', headerCellDef: 'action' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  loading = true;
  constructor() { }

  ngOnInit(): void {
    this.getListSmartContract();
  }

  searchToken() {}
  resetSearch() {
    this.textSearch = '';
  }
  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }
  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListSmartContract();
  }

  getListSmartContract() {
    this.loading = true;
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      keyword: this.textSearch,
    };

    // call API
      // this.dataSource = new MatTableDataSource<any>(res.data);
      // this.pageData.length = res.meta.count;

    //mockData
    this.dataSource.data = [
      {
        id: 1,
        address: 'aura12pak6364lc2nvxxnms0qlltzyzc37z376t4k9kc9kw5vx55489ms9h7hfv',
        createData: 3,
        claimedQTY: 2,
        unclaimedQTY: 1
      }
    ]
    this.loading = false;
  }

}
