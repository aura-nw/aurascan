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
import { ContractRegisterType, ContractVerifyType } from 'src/app/core/constants/contract.enum';
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
    { matColumnDef: 'created_at', headerCellDef: 'Time Registered' },
    { matColumnDef: 'action', headerCellDef: '' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent;
  pageSize = 5;
  pageIndex = 0;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  dataBlock: any[];
  dataSearch: any;
  filterSearchData = [];
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
  loading = true;

  constructor(
    public translate: TranslateService,
    public global: Globals,
    private router: Router,
    private contractService: ContractService,
    private datePipe: DatePipe,
    private layout: BreakpointObserver,
    private modalService: NgbModal,
    private toastr: NgxToastrService,
    public walletService: WalletService
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
      limit: this.pageSize,
      offset: this.pageIndex * this.pageSize,
      keyword: this.textSearch,
    };

    this.contractService.getListTypeContract(payload).subscribe((res) => {
      this.pageData = {
        length: res?.meta?.count,
        pageSize: 5,
        pageIndex: PAGE_EVENT.PAGE_INDEX,
      };
      if (res?.data?.length > 0) {
        res.data.forEach((item) => {
          item.created_at = this.datePipe.transform(item.created_at, DATEFORMAT.DATETIME_UTC);
        });
        this.dataSource = res.data;
        this.dataBlock = res.data;
        console.log(this.dataBlock);
        //   this.dataSearch = res.data;
      }
    });
    this.loading = false;
  }

  searchToken(): void {
    this.filterSearchData = null;
    if (this.textSearch.length > 0) {
      let payload = {
        limit: 0,
        offset: 0,
        keyword: this.textSearch,
      };

      this.contractService.getListContract(payload).subscribe((res) => {
        if (res?.data?.length > 0) {
          res.data.forEach((item) => {
            item.updated_at = this.datePipe.transform(item.updated_at, DATEFORMAT.DATETIME_UTC);
          });
          this.dataSearch = res.data;
        }
      });
      let keyWord = this.textSearch.toLowerCase();
      this.filterSearchData = this.dataSearch.filter((data) => data.contract_name.toLowerCase().includes(keyWord));
    }
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
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

  viewPopupDetail(staticDataModal: any, codeID: any) {
    this.isEditMode = false;
    this.currentCodeID = undefined;
    if (codeID) {
      this.currentCodeID = codeID || undefined;
      this.isEditMode = true;
    }
    console.log(this.selectedTypeContract);

    this.modalReference = this.modalService.open(staticDataModal, {
      keyboard: false,
      centered: true,
      backdrop: 'static',
      windowClass: 'modal-holder',
    });
  }

  handleButtonContract(currentCodeID = undefined) {
    if (currentCodeID) {
      this.handleUpdate(currentCodeID);
    } else {
      this.handleRegister();
    }
  }

  handleRegister() {
    const payload = {
      code_id: Number(this.currentCodeID),
      type: this.selectedTypeContract,
      account_address: this.userAddress
    };
    console.log(this.selectedTypeContract);

    this.contractService.registerContractType(payload).subscribe(
      (res) => {
        console.log(res);
        if (res) {
          this.modalReference.close();
          this.getListContract();
          this.selectedTypeContract = '';
          if (res?.data?.Message) {
            let msgError = res?.data?.Message.toString() || 'Error';
            this.toastr.error(msgError);
          }
        }
      },
      (error) => {},
    );
  }

  handleUpdate(codeID = undefined) {
    // const payload = {
    //   code_id: Number(codeID),
    //   type: this.selectedTypeContract,
    //   account_address: 'aura1h6r78trkk2ewrry7s3lclrqu9a22ca3hpmyqfu',
    // };
    console.log(this.selectedTypeContract);

    this.contractService.updateContractType(Number(codeID), this.selectedTypeContract).subscribe(
      (res) => {
        console.log(res);
        if (res) {
          this.modalReference.close();
          this.getListContract();
          this.selectedTypeContract = '';
          if (res?.data?.Message) {
            let msgError = res?.data?.Message.toString() || 'Error';
            this.toastr.error(msgError);
          }
        }
      },
      (error) => {},
    );
  }

  closeDialog(modal) {
    this.selectedTypeContract = '';
    modal.close('Close click');
  }
  validateCurrentCodeID(s: any) {
    this.currentCodeID = s.target.value.replace(/[-]/g,'');
  }
}
