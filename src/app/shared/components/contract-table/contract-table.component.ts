import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { IContractPopoverData, ITableContract } from 'src/app/core/models/contract.model';
import { DropdownElement } from 'src/app/shared/components/dropdown/dropdown.component';
import { DROPDOWN_ELEMENT } from 'src/app/core/models/contract.model';
import { parseLabel } from 'src/app/core/utils/common/parsing';
import { Globals } from 'src/app/global/global';

export interface TableData {
  txHash: string;
  method: string;
  blockHeight: number;
  blockId: number;
  time: Date;
  from: string;
  to: string;
  label: string;
  value: number;
  fee: number;
}

@Component({
  selector: 'app-contract-table',
  templateUrl: './contract-table.component.html',
  styleUrls: ['./contract-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractTableComponent implements OnInit, OnChanges {
  @Input() data: TableData[];
  @Input() length: number;
  @Input() contractInfo!: ITableContract;
  @Input() templates!: Array<TableTemplate>;
  @Input() label!: string;
  @Output() onViewSelected: EventEmitter<DropdownElement> = new EventEmitter();
  @Output() onChangePage: EventEmitter<any> = new EventEmitter();

  elements: DropdownElement[] = DROPDOWN_ELEMENT;
  displayedColumns: string[] = [];

  pageData: PageEvent = null;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  constructor(public translate: TranslateService, public global: Globals) {}

  ngOnChanges(): void {
    this.loadTableData();
  }

  ngOnInit(): void {
    this.displayedColumns = this.templates?.map((dta) => dta.matColumnDef);
  }

  loadTableData() {
    this.pageData = {
      length: this.data.length,
      pageSize: 25,
      pageIndex: PAGE_EVENT.PAGE_INDEX,
    };

    if (this.dataSource) {
      // this.dataSource.paginator = event;
      this.dataSource.data = this.data;
    } else {
      this.dataSource = new MatTableDataSource<any>(this.data);
    }
  }

  paginatorEmit(event): void {
    if (this.dataSource) {
      this.dataSource.paginator = event;
    } else {
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.paginator = event;
    }
  }

  viewSelected(e: DropdownElement): void {
    this.onViewSelected.emit(e);
  }

  getPopoverData(data): IContractPopoverData {
    return {
      amount: data?.value || 0,
      code: 0,
      fee: data?.fee || 0,
      from_address: data?.from || '-',
      to_address: data?.to || '-',
      price: 0,
      status: 'Success',
      symbol: 'AURA',
      tokenAddress: this.contractInfo?.contractsAddress,
      tx_hash: data?.txHash || '-',
    };
  }

  parseLabel(id: string): string {
    return parseLabel(+id);
  }

  pageEvent({ pageIndex }) {
    if (pageIndex?.toString()) {
      this.onChangePage.emit({
        next: pageIndex,
      });
    }
  }
}
