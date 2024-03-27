import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import * as _ from 'lodash';
import { DATEFORMAT, LENGTH_CHARACTER, PAGE_EVENT, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { TYPE_CW4973 } from 'src/app/core/constants/contract.constant';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { TableTemplate } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { shortenAddress } from '../../../../core/utils/common/shorten';

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
    { matColumnDef: 'contract_address', headerCellDef: 'Contract Address', isUrl: '/contracts', headerWidth: 250 },
    { matColumnDef: 'tx_hash', headerCellDef: 'Tx Hash', isUrl: '/tx', headerWidth: 230 },
    { matColumnDef: 'creator_address', headerCellDef: 'Creator', isUrl: '/address', headerWidth: 250 },
    { matColumnDef: 'type', headerCellDef: 'Message', headerWidth: 180 },
    { matColumnDef: 'created_at', headerCellDef: 'Instantiated at', headerWidth: 200 },
    { matColumnDef: 'verified_at', headerCellDef: 'Verified at', headerWidth: 200 },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  lengthAddress = LENGTH_CHARACTER.ADDRESS;
  isLoading = true;
  errTxt: string;

  constructor(
    private contractService: ContractService,
    private datePipe: DatePipe,
  ) {}

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

    this.contractService.getListContractByCode(payload).subscribe({
      next: (res) => {
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
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.status + ' ' + e.statusText;
        }
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
