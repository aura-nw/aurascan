import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { CONTRACT_RESULT, TYPE_CW4973 } from 'src/app/core/constants/contract.constant';
import { ContractRegisterType, ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { shortenAddress } from '../../../core/utils/common/shorten';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-code-id-list',
  templateUrl: './code-id-list.component.html',
  styleUrls: ['./code-id-list.component.scss'],
})
export class CodeIdListComponent implements OnInit, OnDestroy {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  textSearch = '';
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  showBoxSearch = false;
  searchSubject = new Subject();
  destroy$ = new Subject();
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  templates: Array<TableTemplate> = [
    { matColumnDef: 'code_id', headerCellDef: 'Code ID', isUrl: '/code-ids/detail' },
    { matColumnDef: 'tx_hash', headerCellDef: 'TX HASH', isUrl: '/transaction' },
    { matColumnDef: 'creator', headerCellDef: 'Creator', isUrl: '/account' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'instantiates', headerCellDef: 'INSTANTIATES' },
    { matColumnDef: 'created_at', headerCellDef: 'created at' },
    { matColumnDef: 'verified_at', headerCellDef: 'Verified at' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  contractResult = CONTRACT_RESULT;
  contractVerifyType = ContractVerifyType;

  constructor(private contractService: ContractService, public commonService: CommonService) {}

  ngOnInit(): void {
    this.getListCodeIds();
    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.pageData.pageIndex === PAGE_EVENT.PAGE_INDEX) {
          this.getListCodeIds();
        } else {
          this.pageChange.selectPage(0);
        }
      });
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
    this.destroy$.next();
    this.destroy$.complete();
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  getListCodeIds() {
    this.textSearch = this.textSearch?.trim();
    let payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      keyword: this.textSearch,
    };

    const addressNameTag = this.commonService.findNameTag(this.textSearch);
    if (addressNameTag?.length > 0) {
      payload['keyword'] = addressNameTag;
    }

    this.contractService.getListCodeId(payload).subscribe((res) => {
      res?.code?.forEach((k) => {
        k.instantiates = k.smart_contracts_aggregate?.aggregate?.count || 0;
        k.tx_hash = k.store_hash;
        k.verified_at = k.code_id_verifications[0]?.verified_at;
        k.contract_verification = k.code_id_verifications[0]?.verification_status;
        if (k.type === ContractRegisterType.CW721 && k.smart_contracts[0]?.name === TYPE_CW4973) {
          k.type = ContractRegisterType.CW4973;
        }
      });

      this.dataSource.data = res.code;
      this.pageData.length = res?.code_aggregate?.aggregate?.count || 0;
    });
  }

  resetFilterSearch() {
    this.textSearch = '';
    this.onKeyUp();
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.showBoxSearch = false;
    this.getListCodeIds();
  }

  shortenAddress(address: string): string {
    if (address) {
      return shortenAddress(address, 8);
    }
    return '';
  }
}
