import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { ContractService } from 'src/app/core/services/contract.service';

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
    if (this.contractAddress) {
      this.contractService.loadContractDetail(this.contractAddress).subscribe((res) => {
        if (res?.smart_contract[0]) {
          this.contractService.setContract(res?.smart_contract[0]);
        } else {
          this.contractService.setContract(null);
        }
      });
    }
    this.subscription = this.contractService.contractObservable.subscribe((res) => {
      if (res) {
        res.tx_hash = res.instantiate_hash;
        res.execute_msg_schema = _.get(res, 'code.code_id_verifications[0].execute_msg_schema');
        res.instantiate_msg_schema = _.get(res, 'code.code_id_verifications[0].instantiate_msg_schema');
        res.query_msg_schema = _.get(res, 'code.code_id_verifications[0].query_msg_schema');
        res.contract_hash = _.get(res, 'code.code_id_verifications[0].data_hash');
        this.contractDetail = res;
      } else {
        this.contractDetail = null;
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
