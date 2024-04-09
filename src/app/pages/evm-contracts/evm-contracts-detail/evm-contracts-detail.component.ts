import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { Subject, map, of, switchMap, takeUntil } from 'rxjs';
import { STORAGE_KEYS } from 'src/app/core/constants/common.constant';
import { EWalletType } from 'src/app/core/constants/wallet.constant';
import { CommonService } from 'src/app/core/services/common.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { UserService } from 'src/app/core/services/user.service';
import local from 'src/app/core/utils/storage/local';

@Component({
  selector: 'app-evm-contracts-detail',
  templateUrl: './evm-contracts-detail.component.html',
  styleUrls: ['./evm-contracts-detail.component.scss'],
})
export class EvmContractsDetailComponent implements OnInit, OnDestroy {
  contractAddress: string;
  contractDetail: any;
  modalReference: any;
  isWatchList = false;
  isLoading = true;
  errTxt: string;

  contract$ = this.route.paramMap.pipe(
    map((data) => {
      return data.get('contractAddress');
    }),
  );

  destroyed$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private contractService: ContractService,
    private modalService: NgbModal,
    public commonService: CommonService,
    private router: Router,
    private userService: UserService,
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.contract$
      .pipe(
        switchMap((ca) => {
          if (!ca) {
            return of(null);
          }

          if (ca.trim().length === 0 || !ca.trim().startsWith(EWalletType.EVM)) {
            this.router.navigate(['evm-contracts']);
          }

          this.contractAddress = ca;
          this.checkWatchList();

          return this.contractService.queryEvmContractByAddress(ca);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe((res) => {
        this.isLoading = false;

        if (res) {
          const evm_contract_verification = _.get(res, 'evm_contract_verification[0]') || {};
          const evm_smart_contract = _.get(res, 'evm_smart_contract[0]') || {};

          const contractDetail = {
            ...evm_smart_contract,
            ...evm_contract_verification,
          };

          this.contractService.setContract(contractDetail);
        }
      });

    this.contractService.contractObservable.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (res) => {
        this.contractDetail = {
          ...res,
          tx_hash: res.created_hash,
          contract_hash: res.code_hash,
        };
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
    if (lstWatchList?.find((k) => k.address === this.contractAddress || k.evmAddress === this.contractAddress)) {
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
