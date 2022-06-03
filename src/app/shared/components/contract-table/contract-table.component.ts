import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { IContractPopoverData, ITableContract } from 'src/app/core/models/contract.model';
import { DropdownElement } from 'src/app/shared/components/dropdown/dropdown.component';
import { DROPDOWN_ELEMENT } from 'src/app/core/models/contract.model';

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
  @Input() contractInfo!: ITableContract;
  @Input() templates!: Array<TableTemplate>;
  @Output() onViewSelected: EventEmitter<DropdownElement> = new EventEmitter();

  elements: DropdownElement[] = DROPDOWN_ELEMENT;
  displayedColumns: string[] = [];

  pageData: PageEvent = null;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  constructor(public translate: TranslateService) {}

  ngOnChanges(): void {
    this.loadTableData();
  }

  ngOnInit(): void {
    this.displayedColumns = this.templates?.map((dta) => dta.matColumnDef);
  }

  loadTableData() {
    this.pageData = {
      length: this.data.length,
      pageSize: PAGE_EVENT.PAGE_SIZE,
      pageIndex: PAGE_EVENT.PAGE_INDEX,
    };

    this.dataSource = new MatTableDataSource<any>(this.data);
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  viewSelected(e: DropdownElement): void {
    this.onViewSelected.emit(e);
  }

  getPopoverData(data): IContractPopoverData {
    return {
      amount: 1000,
      code: 0,
      fee: 0.111,
      from_address: 'aura1tuc47nqcfr426gdynf7yqaz4u0psl5609ccsadp276vgkeykda9s96yv0z',
      to_address: 'aura1h6r78trkk2ewrry7s3lclrqu9a22ca3hpmyqfu',
      price: 123,
      status: 'Success',
      symbol: 'AURA',
      tokenAddress: 'aura1tuc47nqcfr426gdynf7yqaz4u0psl5609ccsadp276vgkeykda9s96yv0z',
      tx_hash: '8B830E4B7339EB68933D40AC62E24E51867F5447D2703F6605672E44E42A8358',
    };
  }
}
