import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { ContractTransactionType } from 'src/app/core/constants/contract.enum';
import { TRANSACTION_TYPE_ENUM } from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { DROPDOWN_ELEMENT, IContractPopoverData, ITableContract } from 'src/app/core/models/contract.model';
import { balanceOf, parseLabel } from 'src/app/core/utils/common/parsing';
import { Globals } from 'src/app/global/global';
import { DropdownElement } from 'src/app/shared/components/dropdown/dropdown.component';

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
  gas_used: number;
  gas_wanted: number;
}

@Component({
  selector: 'app-contract-table',
  templateUrl: './contract-table.component.html',
  styleUrls: ['./contract-table.component.scss'],
})
export class ContractTableComponent implements OnInit, OnChanges {
  @Input() dataList;
  @Input() length: number;
  @Input() contractInfo!: ITableContract;
  @Input() templates!: Array<TableTemplate>;
  @Input() label!: string;
  @Output() onViewSelected: EventEmitter<DropdownElement> = new EventEmitter();
  @Output() onChangePage: EventEmitter<any> = new EventEmitter();

  elements: DropdownElement[] = DROPDOWN_ELEMENT;
  displayedColumns: string[] = [];
  transactionTableData: TableData[];

  pageData: PageEvent = null;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  denom = this.environmentService.apiUrl.value.chain_info.currencies[0].coinDenom;

  constructor(
    public translate: TranslateService,
    public global: Globals,
    private environmentService: EnvironmentService,
  ) {}

  ngOnChanges(): void {
    this.getListContractTransaction();
    this.loadTableData();
  }

  ngOnInit(): void {
    this.displayedColumns = this.templates?.map((dta) => dta.matColumnDef);
  }

  loadTableData() {
    this.pageData = {
      length: this.dataList?.data?.length,
      pageSize: 25,
      pageIndex: PAGE_EVENT.PAGE_INDEX,
    };

    if (this.dataSource) {
      // this.dataSource.paginator = event;
      this.dataSource.data = this.transactionTableData;
    } else {
      this.dataSource = new MatTableDataSource<any>(this.transactionTableData);
    }
  }

  paginatorEmit(event): void {
    if (this.dataSource) {
      this.dataSource.paginator = event;
    } else {
      this.dataSource = new MatTableDataSource(this.transactionTableData);
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
      symbol: this.denom,
      tokenAddress: this.contractInfo?.contractsAddress,
      tx_hash: data?.txHash || '-',
      gas_used: data.gas_used,
      gas_wanted: data.gas_wanted,
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

  getListContractTransaction(): void {
    this.contractInfo.count = this.dataList?.meta?.count || 0;
    const ret = this.dataList?.data.map((contract) => {
      let value = 0;
      let from = '';
      let to = '';
      let method = '';
      switch (contract.type) {
        case TRANSACTION_TYPE_ENUM.InstantiateContract:
          method = 'instantiate';
          from = contract.messages[0].sender;
          to = contract.contract_address;
          break;
        case TRANSACTION_TYPE_ENUM.Send:
          method = 'transfer';
          value = +contract.messages[0]?.amount[0].amount;
          from = contract.messages[0].from_address;
          to = contract.messages[0].to_address;
          break;
        case TRANSACTION_TYPE_ENUM.ExecuteContract:
          method = Object.keys(contract.messages[0].msg)[0];
          value = +contract.messages[0].funds[0]?.amount;
          from = contract.messages[0].sender;
          to = contract.messages[0].contract;
          break;
        default:
          method = Object.keys(contract.messages[0].msg)[0];
          value = 0;
          from = contract.messages[0].sender;
          to = contract.messages[0].contract;
          break;
      }

      const label =
        contract.messages[0].sender === this.contractInfo?.contractsAddress
          ? ContractTransactionType.OUT
          : ContractTransactionType.IN;

      const tableDta: TableData = {
        txHash: contract.tx_hash,
        method,
        blockHeight: contract.height,
        blockId: contract.blockId,
        time: new Date(contract.timestamp),
        from,
        label,
        to,
        value: balanceOf(value) || 0,
        fee: +contract.fee,
        gas_used: +contract.gas_used,
        gas_wanted: +contract.gas_wanted,
      };
      return tableDta;
    });
    this.transactionTableData = ret;
  }
}
