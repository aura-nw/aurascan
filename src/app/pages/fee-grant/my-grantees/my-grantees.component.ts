import {Component, OnInit} from '@angular/core';
import {MAX_LENGTH_SEARCH_TOKEN} from "src/app/core/constants/token.constant";
import {PAGE_EVENT} from "src/app/core/constants/common.constant";
import {MatTableDataSource} from "@angular/material/table";
import {TableTemplate} from "src/app/core/models/common.model";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {CommonService} from "src/app/core/services/common.service";
import {Globals} from "src/app/global/global";
import {EnvironmentService} from "src/app/core/data-services/environment.service";
import {HttpClient} from "@angular/common/http";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {PopupRevokeComponent} from "src/app/pages/fee-grant/popup-revoke/popup-revoke.component";

@Component({
  selector: 'app-my-grantees',
  templateUrl: './my-grantees.component.html',
  styleUrls: ['./my-grantees.component.scss']
})
export class MyGranteesComponent implements OnInit {
  loading = true;
  isActive = true;
  textSearch = '';
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  dataSource = new MatTableDataSource<any>();
  templatesActive: Array<TableTemplate> = [
    {matColumnDef: 'tx_hash', headerCellDef: 'TX HASH'},
    {matColumnDef: 'grantee', headerCellDef: 'GRANTEE'},
    {matColumnDef: 'type', headerCellDef: 'TYPE'},
    {matColumnDef: 'time', headerCellDef: 'TIME'},
    {matColumnDef: 'limit', headerCellDef: 'SPEND LIMIT'},
    {matColumnDef: 'expiration', headerCellDef: 'EXPIRATION'},
    {matColumnDef: 'spendable', headerCellDef: 'SPENDABLE'},
    {matColumnDef: 'action', headerCellDef: ''},
  ];
  templatesInActive: Array<TableTemplate> = [
    {matColumnDef: 'tx_hash', headerCellDef: 'TX HASH'},
    {matColumnDef: 'grantee', headerCellDef: 'GRANTEE'},
    {matColumnDef: 'type', headerCellDef: 'TYPE'},
    {matColumnDef: 'time', headerCellDef: 'TIME'},
    {matColumnDef: 'limit', headerCellDef: 'SPEND LIMIT'},
    {matColumnDef: 'expiration', headerCellDef: 'EXPIRATION'},
    {matColumnDef: 'reason', headerCellDef: 'REASON'},
  ];
  templates: Array<TableTemplate>;
  displayedColumns: string[];
  pageData: PageEvent;
  nextKey = null;
  currentKey = null;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;

  constructor(
    public commonService: CommonService,
    public global: Globals,
    private environmentService: EnvironmentService,
    private http: HttpClient,
    private dialog: MatDialog,
  ) {
  }

  async ngOnInit() {
    await this.getGranteesData();
  }

  async getGranteesData() {
    this.loading = true;
    if (this.isActive) {
      this.templates = this.templatesActive;
      this.displayedColumns = this.templatesActive.map((dta) => dta.matColumnDef);
      // @ts-ignore
      this.dataSource.data = await this.http.get('assets/mock-data/grantees-active.json').toPromise();
    } else {
      this.templates = this.templatesInActive;
      this.displayedColumns = this.templatesInActive.map((dta) => dta.matColumnDef);
      // @ts-ignore
      this.dataSource.data = await this.http.get('assets/mock-data/grantees-inactive.json').toPromise();
    }
    this.pageData = {
      length: this.dataSource.data.length,
      pageSize: 5,
      pageIndex: PAGE_EVENT.PAGE_INDEX,
    };
    this.loading = false;
  }

  searchToken(): void {
    this.textSearch !== '';
    if (this.textSearch && this.textSearch.length > 0) {
      const payload = {
        limit: 100,
        keyword: this.textSearch,
        next_key: this.nextKey,
      };
      // this.contractService.getListContract(payload).subscribe((res) => {
      //   if (res?.data?.length > 0) {
      //     res.data.forEach((item) => {
      //       item.updated_at = this.datePipe.transform(item.updated_at, DATEFORMAT.DATETIME_UTC);
      //     });
      //     this.filterSearchData = res.data;
      //   }
      // });
    }
  }

  resetFilterSearch() {
    this.textSearch = '';
  }

  paginatorEmit(e: MatPaginator): void {
    const {pageIndex, pageSize} = e;
    const next = this.pageData.length <= (pageIndex + 2) * pageSize;

    this.pageData.pageIndex = e.pageIndex;
    if (next && this.nextKey && this.currentKey !== this.nextKey) {
      this.getGranteesData();
      this.currentKey = this.nextKey;
    }
  }

  async changeType(type: boolean) {
    this.isActive = type;
    await this.getGranteesData();
  }

  showRevoke(granteeAddress: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'revoke-overlay-pane';
    dialogConfig.data = {
      granterAddress: 'auralluwyzsc5pnygennjOufyquqfue@nqxvqmaskko',
      granteeAddress: granteeAddress
    };
    this.dialog.open(PopupRevokeComponent, dialogConfig);
  }
}
