import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { STORAGE_KEYS, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { CommonService } from 'src/app/core/services/common.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { UserService } from 'src/app/core/services/user.service';
import local from 'src/app/core/utils/storage/local';

@Component({
  selector: 'app-contracts-detail',
  templateUrl: './contracts-detail.component.html',
  styleUrls: ['./contracts-detail.component.scss'],
})
export class ContractsDetailComponent implements OnInit, OnDestroy {
  contractAddress: string;
  contractDetail: any;
  modalReference: any;
  subscription: Subscription;
  isWatchList = false;
  isLoading = true;
  errTxt: string;

  constructor(
    private route: ActivatedRoute,
    private contractService: ContractService,
    private modalService: NgbModal,
    public commonService: CommonService,
    private router: Router,
    private userService: UserService,
  ) {}

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.contractAddress = this.route.snapshot.paramMap.get('contractAddress');
    this.checkWatchList();
    if (this.contractAddress) {
      this.contractService.loadContractDetail(this.contractAddress).subscribe({
        next: (res) => {
          if (res?.smart_contract[0]) {
            this.contractService.setContract(res?.smart_contract[0]);
          } else {
            this.contractService.setContract(null);
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
    this.subscription = this.contractService.contractObservable.subscribe({
      next: (res) => {
        if (res?.instantiate_hash) {
          res.tx_hash = res.instantiate_hash;
          res.execute_msg_schema = _.get(res, 'code.code_id_verifications[0].execute_msg_schema');
          res.instantiate_msg_schema = _.get(res, 'code.code_id_verifications[0].instantiate_msg_schema');
          res.query_msg_schema = _.get(res, 'code.code_id_verifications[0].query_msg_schema');
          res.contract_hash = _.get(res, 'code.code_id_verifications[0].data_hash');
        }
        this.contractDetail = res;
      },
    });
  }

  viewQrAddress(staticDataModal: any): void {
    this.modalReference = this.modalService.open(staticDataModal, {
      keyboard: false,
      centered: true,
      size: 'sm',
      windowClass: 'modal-holder contact-qr-modal',
    });
  }

  closePopup() {
    this.modalReference.close();
  }

  checkWatchList() {
    // get watch list form local storage
    const lstWatchList = local.getItem<any>(STORAGE_KEYS.LIST_WATCH_LIST);
    if (lstWatchList?.find((k) => k.address === this.contractAddress)) {
      this.isWatchList = true;
    }
  }

  handleWatchList() {
    if (this.isWatchList) {
      this.router.navigate(['/profile'], { queryParams: { tab: 'watchList' } });
    } else {
      this.editWatchList();
    }
  }

  editWatchList() {
    const userEmail = this.userService.getCurrentUser()?.email;
    if (userEmail) {
      local.setItem(STORAGE_KEYS.SET_ADDRESS_WATCH_LIST, { address: this.contractAddress, type: 'contract' });
      this.router.navigate(['/profile'], { queryParams: { tab: 'watchList' } });
    } else {
      this.router.navigate(['/login']);
    }
  }
}
