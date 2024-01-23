import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { TranslateService } from '@ngx-translate/core';
import { LENGTH_CHARACTER, PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { TRANSACTION_TYPE_ENUM } from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { DROPDOWN_ELEMENT, ITableContract } from 'src/app/core/models/contract.model';
import { balanceOf, parseLabel } from 'src/app/core/utils/common/parsing';
import { DropdownElement } from 'src/app/shared/components/dropdown/dropdown.component';
import { getTypeTx } from 'src/app/core/utils/common/info-common';

export interface TableData {
  txHash: string;
  method: string;
  status: string;
  blockHeight: number;
  blockId: number;
  time: Date;
  from: string;
  to: string;
  // label: string;
  value: number;
  fee: number;
  gas_used: number;
  gas_wanted: number;
  lst_type?: Array<any>;
}

@Component({
  selector: 'app-contract-table',
  templateUrl: './contract-table.component.html',
  styleUrls: ['./contract-table.component.scss'],
})
export class ContractTableComponent implements OnInit, OnChanges {
  @Input() dataList;
  @Input() length: number;
  @Input() pageSize = 25;
  @Input() contractInfo!: ITableContract;
  @Input() templates!: Array<TableTemplate>;
  @Input() label!: string;
  @Input() nextKey: string;
  @Input() viewAll = false;
  @Output() onViewSelected: EventEmitter<DropdownElement> = new EventEmitter();
  @Output() onChangePage: EventEmitter<any> = new EventEmitter();

  elements: DropdownElement[] = DROPDOWN_ELEMENT;
  displayedColumns: string[] = [];
  transactionTableData: TableData[];

  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  isLoading = true;
  isMoreTx = false;
  lengthAddress = LENGTH_CHARACTER.ADDRESS;

  constructor(
    public translate: TranslateService,
    private environmentService: EnvironmentService,
  ) {}

  ngOnChanges(): void {
    if (this.dataList?.data) {
      this.getListContractTransaction();
      this.loadTableData();
    } else {
      this.isLoading = false;
    }
  }

  ngOnInit(): void {
    this.displayedColumns = this.templates?.map((dta) => dta.matColumnDef);
  }

  loadTableData() {
    this.pageData = {
      length: this.dataList.count,
      pageSize: this.pageSize,
      pageIndex: PAGE_EVENT.PAGE_INDEX,
    };

    if (this.dataSource) {
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

  parseLabel(id: string): string {
    return parseLabel(+id);
  }

  pageEvent(event) {
    this.onChangePage.emit(event);
  }

  getListContractTransaction(): void {
    this.contractInfo.count = this.dataList?.count || 0;
    const ret = this.dataList?.data?.map((contract) => {
      let value = 0;
      let from = '';
      let to = '';
      let method = '';
      let msg = contract.messages[0]?.msg;
      if (typeof msg === 'string') {
        try {
          msg = JSON.parse(contract.messages[0]?.msg);
        } catch (e) {}
      }

      switch (contract.typeOrigin) {
        case TRANSACTION_TYPE_ENUM.InstantiateContract:
        case TRANSACTION_TYPE_ENUM.InstantiateContract2:
          method = 'Instantiate';
          from = contract.messages[0].sender;
          to = contract.contract_address || this.contractInfo.contractsAddress;
          break;
        case TRANSACTION_TYPE_ENUM.Send:
          method = 'Transfer';
          value = +contract.messages[0]?.amount[0].amount;
          from = contract.messages[0].from_address;
          to = contract.messages[0].to_address;
          break;
        case TRANSACTION_TYPE_ENUM.ExecuteContract:
          method = getTypeTx(contract.tx.tx.body)?.type;
          value = +contract.messages[0].funds[0]?.amount;
          from = contract.messages[0].sender;
          to = contract.messages[0].contract;
          break;
        default:
          if (msg && Object.keys(msg)[0]?.length > 1) {
            method = Object.keys(msg)[0];
          } else {
            method = getTypeTx(contract.tx.tx.body)?.type;
          }
          if (contract.messages[0]?.funds) {
            value = +contract.messages[0]?.funds[0]?.amount;
          }
          from = contract.messages[0].sender;
          to = contract.messages[0].contract;
          break;
      }

      // const label =
      //   contract.messages[0].sender === this.contractInfo?.contractsAddress
      //     ? ContractTransactionType.OUT
      //     : ContractTransactionType.IN;

      const tableDta: TableData = {
        txHash: contract.tx_hash,
        method,
        status: contract.status,
        blockHeight: contract.height,
        blockId: contract.blockId,
        time: new Date(contract.timestamp),
        from,
        // label,
        to,
        value: balanceOf(value) || 0,
        fee: +contract.fee,
        gas_used: +contract.gas_used,
        gas_wanted: +contract.gas_wanted,
        lst_type: contract.lstType
      };
      return tableDta;
    });
    this.transactionTableData = ret;

    if (ret) {
      this.isLoading = false;
    } else {
      setTimeout(() => {
        this.isLoading = false;
      }, 2000);
    }
  }
}
