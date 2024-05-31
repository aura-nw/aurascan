import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { LENGTH_CHARACTER, PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { EVM_CONTRACT_TABLE_TEMPLATES } from 'src/app/core/constants/contract.constant';
import { TRANSACTION_TYPE_ENUM } from 'src/app/core/constants/transaction.enum';
import { EWalletType } from 'src/app/core/constants/wallet.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { DROPDOWN_ELEMENT, ITableContract } from 'src/app/core/models/contract.model';
import { getTypeTx } from 'src/app/core/utils/common/info-common';
import { balanceOf, parseLabel } from 'src/app/core/utils/common/parsing';
import { DropdownElement } from 'src/app/shared/components/dropdown/dropdown.component';
import { ContractService } from '../../../core/services/contract.service';
import { map } from 'rxjs';

export interface TableData {
  txHash: string;
  method: string;
  status: string;
  blockHeight: number;
  time: Date;
  from: string;
  to?: string;
  value?: number;
  fee: number;
  gas_used?: number;
  gas_wanted?: number;
  lst_type?: Array<any>;
}

export interface EvmTableData {
  txHash: string;
  method: string;
  height: number;
  time: Date;
  from: string;
  to?: string;
  amount?: number;
  fromIsEvmContract?: boolean;
  toIsEvmContract?: boolean;
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
  evmDecimal = this.environmentService.evmDecimal;
  isLoading = true;
  isMoreTx = false;
  lengthAddress = LENGTH_CHARACTER.ADDRESS;

  timerRefress: any;

  constructor(
    public translate: TranslateService,
    private environmentService: EnvironmentService,
    private router: Router,
    private contractService: ContractService,
  ) {}

  ngOnChanges(): void {
    this.getListTransaction();
  }

  ngOnInit(): void {
    this.displayedColumns = this.templates?.map((dta) => dta.matColumnDef);
    this.timerRefress = setInterval(() => {
      if (this.pageData.pageIndex === 1) {
        this.getListTransaction();
      }
    }, 30000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timerRefress);
  }

  getListTransaction() {
    if (this.dataList?.data) {
      if (this.contractInfo.contractsAddress.startsWith(EWalletType.EVM)) {
        this.getListEVMContractTransaction();
      } else {
        this.getListContractTransaction();
      }
      this.loadTableData();
    } else {
      this.isLoading = false;
    }
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

  getListEVMContractTransaction(): void {
    this.contractInfo.count = this.dataList?.count || 0;
    let listAddr = [];

    const ret = this.dataList?.data?.map((contract) => {
      const tableDta: EvmTableData = {
        txHash: _.get(contract, 'tx_hash'),
        method: _.get(contract, 'method'),
        from: _.get(contract, 'from'),
        height: _.get(contract, 'height'),
        to: _.get(contract, 'to'),
        time: _.get(contract, 'timestamp'),
        amount: _.get(contract, 'evmAmount'),
      };
      listAddr.push(tableDta.from);
      listAddr.push(tableDta.to);
      return tableDta;
    });

    const listAddrUnique = _.uniq(listAddr);
    this.contractService.findEvmContractList(listAddrUnique).subscribe({
      next: (res) => {
        const smartContractList = _.uniq((res?.evm_smart_contract || []).map((i) => i?.address));
        const trans = ret.map((i: EvmTableData) => ({
          ...i,
          toIsEvmContract: smartContractList.filter((s) => s === i.to).length > 0,
          fromIsEvmContract: smartContractList.filter((s) => s === i.from).length > 0,
        }));
        this.transactionTableData = trans;
        this.loadTableData();
        if (trans) {
          this.isLoading = false;
        } else {
          setTimeout(() => {
            this.isLoading = false;
          }, 2000);
        }
      },
      error: (e) => {},
      complete: () => {},
    });
  }

  getListContractTransaction(): void {
    this.contractInfo.count = this.dataList?.count || 0;
    const ret = this.dataList?.data?.map((contract) => {
      let value = 0;
      let from = '';
      let method = '';
      let msg = contract.messages[0]?.msg;
      if (typeof msg === 'string') {
        try {
          msg = JSON.parse(contract.messages[0]?.msg);
        } catch (e) {}
      }

      if (
        contract.typeOrigin === TRANSACTION_TYPE_ENUM.InstantiateContract ||
        contract.typeOrigin === TRANSACTION_TYPE_ENUM.InstantiateContract2
      ) {
        method = 'Instantiate';
      } else if (contract.typeOrigin === TRANSACTION_TYPE_ENUM.ExecuteContract) {
        method = contract?.type;
      } else {
        if (msg && Object.keys(msg)[0]?.length > 1) {
          method = Object.keys(msg)[0];
        } else {
          method = getTypeTx(contract)?.type;
        }
      }
      from =
        _.get(contract, 'messages[0].sender') ||
        _.get(contract, 'messages[0].from_address') ||
        _.get(contract, 'messages[0].content.sender') ||
        _.get(contract, 'messages[0].content.from_address');

      const tableDta: TableData = {
        txHash: contract.tx_hash,
        method,
        status: contract.status,
        blockHeight: contract.height,
        time: new Date(contract.timestamp),
        from,
        // label,
        value: balanceOf(value) || 0,
        fee: +contract.fee,
        lst_type: contract.lstType,
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

  navigateToViewAll() {
    if (this.contractInfo.contractsAddress.startsWith(EWalletType.EVM)) {
      this.router.navigate([`/evm-contracts/transactions`, this.contractInfo.contractsAddress]);
    } else {
      this.router.navigate([`/contracts/transactions`, this.contractInfo.contractsAddress]);
    }
  }
}
