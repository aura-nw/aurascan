import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DATEFORMAT, LENGTH_CHARACTER, PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { CONTRACT_RESULT, TYPE_CW4973 } from 'src/app/core/constants/contract.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { shortenAddress } from '../../../../core/utils/common/shorten';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import * as _ from 'lodash';

@Component({
  selector: 'app-code-id-contracts-tab',
  templateUrl: './code-id-contracts-tab.component.html',
  styleUrls: ['./code-id-contracts-tab.component.scss'],
})
export class CodeIdContractsTabComponent implements OnInit {
  @Input() codeId: string;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  templates: Array<TableTemplate> = [
    { matColumnDef: 'contract_address', headerCellDef: 'CONTRACT ADDRESS', isUrl: '/contracts' },
    { matColumnDef: 'tx_hash', headerCellDef: 'TX HASH', isUrl: '/transaction' },
    { matColumnDef: 'creator_address', headerCellDef: 'Creator', isUrl: '/account' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'created_at', headerCellDef: 'INSTANTIATED at' },
    { matColumnDef: 'verified_at', headerCellDef: 'Verified at' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  lengthAddress = LENGTH_CHARACTER.ADDRESS;

  constructor(private contractService: ContractService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.getListContractByCode();
  }
  shortenAddress(address: string): string {
    if (address) {
      return shortenAddress(address, 8);
    }
    return '';
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListContractByCode();
  }

  getListContractByCode() {
    let payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      codeId: this.codeId.toString(),
    };

    this.contractService.getListContractByCode(payload).subscribe((res) => {
      this.pageData.length = res?.smart_contract?.length || 0;
      if (res?.smart_contract?.length > 0) {
        res?.smart_contract.forEach((item) => {
          item.updated_at = this.datePipe.transform(item?.created_at, DATEFORMAT.DATETIME_UTC);
          item.contract_address = item?.address;
          item.tx_hash = item?.instantiate_hash;
          item.creator_address = item?.creator;
          item.verified_at = _.get(item, 'code.code_id_verifications[0].verified_at');
          item.type = item.code?.type || '-';
          if (item.type === ContractRegisterType.CW721 && item.smart_contracts?.name === TYPE_CW4973) {
            item.type = ContractRegisterType.CW4973;
          }
        });
        this.dataSource.data = res.smart_contract;
      }
    });
  }
}
