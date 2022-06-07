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
      pageSize: 25,
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
    /* 
      blockHeight: 2823954
      blockId: 3039232
      fee: 0.00014
      from: "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
      label: "TO"
      method: "mint"
      time: Thu Jun 02 2022 15:34:19 GMT+0700 (Indochina Time) {}
      to: "aura1d96q6hrhn9287xqlg696gd2msrnffp27xd2dpft99u2pq79r28jsfrrztp"
      txHash: "93285223BDEDEA423A615A14BD0CFB165F52C6208D075F977463B112D5E3C747"
      value: 0
    */

    return {
      amount: data?.value || 0,
      code: 0,
      fee: data?.fee || 0,
      from_address: data?.from || '-', //'aura1tuc47nqcfr426gdynf7yqaz4u0psl5609ccsadp276vgkeykda9s96yv0z',
      to_address: data?.to || '-', //'aura1h6r78trkk2ewrry7s3lclrqu9a22ca3hpmyqfu',
      price: 0,
      status: 'Success',
      symbol: 'AURA',
      tokenAddress: this.contractInfo?.contractsAddress,//'aura1tuc47nqcfr426gdynf7yqaz4u0psl5609ccsadp276vgkeykda9s96yv0z',
      tx_hash: data?.txHash || '-', //'8B830E4B7339EB68933D40AC62E24E51867F5447D2703F6605672E44E42A8358',
    };
  }
}
