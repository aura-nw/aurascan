import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import * as _ from 'lodash';
import { DATEFORMAT, LENGTH_CHARACTER, PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { TYPE_CW4973 } from 'src/app/core/constants/contract.constant';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { TableTemplate } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { shortenAddress } from '../../../../core/utils/common/shorten';
import { CommonService } from 'src/app/core/services/common.service';

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
    pageIndex: 1,
  };
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  templates: Array<TableTemplate> = [
    { matColumnDef: 'contract_address', headerCellDef: 'CONTRACT ADDRESS', isUrl: '/contracts' },
    { matColumnDef: 'tx_hash', headerCellDef: 'TX HASH', isUrl: '/transaction' },
    { matColumnDef: 'creator_address', headerCellDef: 'Creator', isUrl: '/account' },
    { matColumnDef: 'type', headerCellDef: 'Message' },
    { matColumnDef: 'created_at', headerCellDef: 'INSTANTIATED at' },
    { matColumnDef: 'verified_at', headerCellDef: 'Verified at' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  lengthAddress = LENGTH_CHARACTER.ADDRESS;

  constructor(private contractService: ContractService, private datePipe: DatePipe, public commonService: CommonService) {}

  ngOnInit(): void {
    this.getListContractByCode();
  }

  shortenAddress(address: string): string {
    if (address) {
      return shortenAddress(address, 8);
    }
    return '';
  }

  pageEvent(pageIndex: number): void {
    // reset page 1 if pageIndex = 0
    if (pageIndex === 0) {
      this.pageData.pageIndex = 1;
    }
    this.getListContractByCode();
  }

  getListContractByCode() {
    let payload = {
      limit: this.pageData.pageSize,
      offset: (this.pageData.pageIndex - 1) * this.pageData.pageSize,
      codeId: this.codeId.toString(),
    };

    this.contractService.getListContractByCode(payload).subscribe((res) => {
      this.pageData.length = res?.smart_contract_aggregate?.aggregate?.count || 0;
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
