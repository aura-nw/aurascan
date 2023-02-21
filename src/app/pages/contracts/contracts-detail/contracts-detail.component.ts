import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { ResponseDto } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { balanceOf } from 'src/app/core/utils/common/parsing';

@Component({
  selector: 'app-contracts-detail',
  templateUrl: './contracts-detail.component.html',
  styleUrls: ['./contracts-detail.component.scss'],
})
export class ContractsDetailComponent implements OnInit, OnDestroy {
  contractAddress: string | number;
  contractDetail: any;
  priceToken = 0;
  modalReference: any;
  subscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private contractService: ContractService,
    private modalService: NgbModal,
  ) {}

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.contractAddress = this.route.snapshot.paramMap.get('contractAddress');

    this.contractService.loadContractDetail(this.contractAddress);

    this.subscription = this.contractService.contractObservable.subscribe((res: ResponseDto) => {
      if (res?.data) {
        this.contractDetail = res?.data;
        this.contractDetail.balance = balanceOf(this.contractDetail?.balance);
        this.contractDetail.price = this.contractDetail?.balance * this.priceToken || 0;
      }
    });
  }

  copyData(): void {
    let text = this.contractAddress.toString();
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    // fake event click out side copy button
    // this event for hidden tooltip
    setTimeout(function () {
      document.getElementById('ttiopa123').click();
    }, 800);
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
}
