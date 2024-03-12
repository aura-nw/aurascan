import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, of, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ContractService } from 'src/app/core/services/contract.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';
import * as _ from 'lodash';

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
          this.contractAddress = ca;

          return this.contractService.queryEvmContractByAddress(ca);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe((res) => {
        this.isLoading = false;

        if (res) {
          this.contractDetail = _.get(res, 'evm_smart_contract[0]');
        }
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

  checkWatchList() {}

  handleWatchList() {}

  editWatchList() {}
}
