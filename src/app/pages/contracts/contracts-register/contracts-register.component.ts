import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { REGISTER_CONTRACT } from 'src/app/core/constants/contract.constant';
import { ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { MESSAGES_CODE } from 'src/app/core/constants/messages.constant';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { DATEFORMAT, PAGE_EVENT } from '../../../core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from '../../../core/constants/token.constant';
import { TableTemplate } from '../../../core/models/common.model';
import { ContractService } from '../../../core/services/contract.service';
import { shortenAddress } from '../../../core/utils/common/shorten';
import { Globals } from '../../../global/global';

@Component({
  selector: 'app-contracts-register',
  templateUrl: './contracts-register.component.html',
  styleUrls: ['./contracts-register.component.scss'],
})
export class ContractsRegisterComponent implements OnInit {
  textSearch = '';
  templates: Array<TableTemplate> = [
    { matColumnDef: 'code_id', headerCellDef: 'Code ID' },
    { matColumnDef: 'type', headerCellDef: 'Type Contract' },
    { matColumnDef: 'result', headerCellDef: 'Result registration' },
    { matColumnDef: 'updated_at', headerCellDef: 'Time Registered' },
    { matColumnDef: 'action', headerCellDef: '' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  dataSourceBk: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  dataBk: any[];
  dataBlock: any[];
  dataSearch: any;
  filterSearchData: any;
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  contractVerifyType = ContractVerifyType;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  currentValidatorDialog: string;
  modalReference: any;
  currentCodeID: undefined;
  isEditMode = false;
  selectedTypeContract: string;
  lstTypeContract = REGISTER_CONTRACT;
  userAddress = '';
  walletAccount: any;
  loading = true;
  isHideSearch = false;
  isDisable = true;

  constructor(
    public translate: TranslateService,
    public global: Globals,
    private router: Router,
    private contractService: ContractService,
    private datePipe: DatePipe,
    private layout: BreakpointObserver,
    private modalService: NgbModal,
    private toastr: NgxToastrService,
    public walletService: WalletService,
  ) {}

  ngOnInit(): void {
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.userAddress = wallet.bech32Address;
      } else {
        this.userAddress = null;
      }
    });
    this.getListContract();
  }

  getListContract() {
    let payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      keyword: this.textSearch,
    };

    this.contractService.getListTypeContract(payload).subscribe((res) => {
      this.pageData = {
        length: res?.meta?.count,
        pageSize: this.pageData.pageSize,
        pageIndex: PAGE_EVENT.PAGE_INDEX,
      };

      if (res?.data?.length > 0) {
        res.data.forEach((item) => {
          item.updated_at = this.datePipe.transform(item.updated_at, DATEFORMAT.DATETIME_UTC);
        });
        this.dataSource = res.data;
        this.dataBk = res.data;
        this.dataBlock = res.data;
      }
    });
    this.loading = false;
  }

  searchCode(): void {
    this.filterSearchData = null;
    this.isHideSearch = false;
    if (this.textSearch.length > 0) {
      let payload = {
        limit: 0,
        offset: 0,
        keyword: this.textSearch,
      };
      this.filterSearchData = [];
      this.contractService.getListTypeContract(payload).subscribe((res) => {
        if (res?.data?.length > 0) {
          res.data.forEach((item) => {
            item.updated_at = this.datePipe.transform(item.updated_at, DATEFORMAT.DATETIME_UTC);
          });
          this.filterSearchData = res.data;
        }
      });
    }
  }

  clearSearch(): void {
    this.filterSearchData = null;
    this.dataSource = new MatTableDataSource<any>(this.dataBk);
    this.dataBlock = this.dataBk;
  }

  replacePageList(item: any): void {
    this.dataSource = new MatTableDataSource<any>([item]);
    this.dataBlock = [item];
    this.isHideSearch = true;
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListContract();
  }

  handleLink(): void {
    this.router.navigate(['/contracts/', this.filterSearchData[0]?.contract_address]);
  }

  shortenAddress(address: string): string {
    if (address) {
      return shortenAddress(address, 8);
    }
    return '';
  }

  viewPopupDetail(staticDataModal: any, data: any) {
    this.isEditMode = false;
    this.currentCodeID = undefined;
    this.selectedTypeContract = undefined;
    if (data?.code_id) {
      this.currentCodeID = data.code_id || undefined;
      this.selectedTypeContract = data.type || undefined;
      this.isEditMode = true;
    }

    this.modalReference = this.modalService.open(staticDataModal, {
      keyboard: false,
      centered: true,
      windowClass: 'modal-holder',
    });
  }

  handleButtonContract(isEditMode: boolean) {
    if (isEditMode) {
      this.handleUpdate(this.currentCodeID);
    } else {
      this.handleRegister();
    }
  }

  connectWallet(): void {
    this.walletAccount = this.walletService.getAccount();
  }

  handleRegister() {
    this.connectWallet();
    if (this.walletAccount) {
      const payload = {
        code_id: Number(this.currentCodeID),
        type: this.selectedTypeContract,
        account_address: this.userAddress,
      };
      this.contractService.registerContractType(payload).subscribe(
        (res) => {
          if (res) {
            this.handleCloseDialog(res);
          }
        },
        (error) => {},
      );
    }
  }

  handleUpdate(codeID = undefined) {
    this.contractService.updateContractType(Number(codeID), this.selectedTypeContract).subscribe(
      (res) => {
        if (res) {
          this.handleCloseDialog(res);
        }
      },
      (error) => {},
    );
  }

  handleCloseDialog(res: any) {
    this.modalReference.close();
    this.getListContract();
    this.selectedTypeContract = '';
    this.isEditMode = false;
    if (res?.data?.Message) {
      let msgError = res?.data?.Message.toString() || 'Error';
      this.toastr.error(msgError);
    } else {
      this.toastr.success(MESSAGES_CODE.SUCCESSFUL.Message);
    }
  }

  closeDialog(modal) {
    this.selectedTypeContract = '';
    modal.close('Close click');
  }

  validateCurrentCodeID(s: any) {
    this.currentCodeID = s.target.value.replace(/[-]/g, '');
  }

  checkInput(): void {
    this.isDisable = true;
    if (this.currentCodeID && this.selectedTypeContract) {
      this.isDisable = false;
    }
  }
}
