import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { from, Subject } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, mergeMap, takeUntil } from 'rxjs/operators';
import { REGISTER_CONTRACT } from 'src/app/core/constants/contract.constant';
import { MESSAGES_CODE } from 'src/app/core/constants/messages.constant';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { DATEFORMAT, PAGE_EVENT } from '../../../core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from '../../../core/constants/token.constant';
import { TableTemplate } from '../../../core/models/common.model';
import { ContractService } from '../../../core/services/contract.service';
import { Globals } from '../../../global/global';

@Component({
  selector: 'app-contracts-register',
  templateUrl: './contracts-register.component.html',
  styleUrls: ['./contracts-register.component.scss'],
})
export class ContractsRegisterComponent implements OnInit {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;
  textSearch = '';
  templates: Array<TableTemplate> = [
    { matColumnDef: 'code_id', headerCellDef: 'Code ID' },
    { matColumnDef: 'type', headerCellDef: 'Message' },
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
  dataBk: any[];
  dataContract: any[];
  filterSearchData: any;
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  modalReference: any;
  currentCodeID: number;
  isEditMode = false;
  selectedTypeContract: string;
  lstTypeContract = REGISTER_CONTRACT;
  userAddress = '';
  walletAccount: any;
  loading = true;
  isHideSearch = false;
  isDisable = true;
  pageLength = 0;
  isProcess = false;
  currentType = '';

  searchSubject = new Subject();
  destroy$ = new Subject();

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    from([1])
      .pipe(
        delay(1000),
        mergeMap((_) => this.walletService.wallet$),
      )
      .subscribe((wallet) => {
        if (wallet) {
          this.userAddress = wallet.bech32Address;
          this.getListContract();

          this.searchSubject
            .asObservable()
            .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
            .subscribe(() => {
              this.pageChange.selectPage(0);
            });
        } else {
          this.userAddress = null;
          this.router.navigate(['/']);
        }
      });
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  getListContract() {
    this.textSearch = this.textSearch?.trim();
    let payload = {
      account_address: this.userAddress,
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      keyword: this.textSearch,
    };

    this.contractService.getListTypeContract(payload).subscribe(
      (res) => {
        if (res) {
          this.pageData = {
            length: res?.meta?.count,
            pageSize: this.pageData.pageSize,
            pageIndex: PAGE_EVENT.PAGE_INDEX,
          };
          this.pageLength = this.pageData?.length;

          res.data?.forEach((item) => {
            item.updated_at = this.datePipe.transform(item.updated_at, DATEFORMAT.DATETIME_UTC);
          });
          this.dataSource = new MatTableDataSource<any>(res.data);
          this.dataBk = res.data || [];
          this.dataContract = res.data || [];
        }
      },
      () => {},
      () => {
        this.loading = false;
      },
    );
  }

  clearSearch(): void {
    this.textSearch = '';
    this.onKeyUp();
  }

  paginatorEmit(event): void {
    if (this.dataSource) {
      this.dataSource.paginator = event;
    }
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListContract();
  }

  viewPopupDetail(staticDataModal: any, data: any) {
    this.isDisable = true;
    this.isEditMode = false;
    this.currentCodeID = undefined;
    this.selectedTypeContract = undefined;
    if (data?.code_id) {
      this.currentCodeID = data.code_id || undefined;
      this.selectedTypeContract = data.type || undefined;
      this.isEditMode = true;
    }
    this.isProcess = false;
    if (this.isEditMode) {
      this.currentType = this.selectedTypeContract;
    }

    this.modalReference = this.modalService.open(staticDataModal, {
      keyboard: false,
      centered: true,
      size: 'md',
      windowClass: 'modal-holder contract-modal',
    });
  }

  handleButtonContract(isEditMode: boolean) {
    this.isProcess = true;
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
            this.isProcess = false;
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
          this.isProcess = false;
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

  closeDialog(modal: any) {
    this.selectedTypeContract = '';
    this.currentCodeID = null;
    this.isDisable = true;
    modal.close('Close click');
  }

  checkInput(): void {
    this.isDisable = true;
    if (this.currentCodeID && this.currentCodeID > 0 && this.selectedTypeContract) {
      this.isDisable = false;
    }
    if (this.isEditMode && this.currentType === this.selectedTypeContract) {
      this.isDisable = true;
    }
  }

  validateCurrentCodeID(event: any) {
    const regex = new RegExp(/[0-9]/g);
    let key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key)) {
      event.preventDefault();
      return;
    }
    this.currentCodeID = event.target.value;
  }
}
