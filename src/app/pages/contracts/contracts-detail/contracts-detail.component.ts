import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ResponseDto } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';

@Component({
  selector: 'app-contracts-detail',
  templateUrl: './contracts-detail.component.html',
  styleUrls: ['./contracts-detail.component.scss'],
})
export class ContractsDetailComponent implements OnInit {
  contractAddress: string | number;
  contractDetail: any;
  priceToken = 0;
  modalReference: any;

  constructor(
    private route: ActivatedRoute,
    private contractService: ContractService,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.contractAddress = this.route.snapshot.paramMap.get('contractAddress');
    this.getContractDetail();
  }

  getContractDetail(): void {
    this.contractService.getContractDetail(this.contractAddress).subscribe((res: ResponseDto) => {
      this.contractDetail = res?.data;
      this.contractDetail.price = this.contractDetail.balance * this.priceToken || 0;
      this.contractDetail.creator_address_format = this.contractDetail.creator_address.replace(
        this.contractDetail.creator_address.substring(20),
        '...',
      );
      this.contractDetail.tx_hash_format = this.contractDetail.tx_hash.replace(
        this.contractDetail.tx_hash.substring(6, this.contractDetail.tx_hash.length - 6),
        '...',
      );
    });
  }

  copyData(): void {
    let text = this.contractAddress.toString();
    var dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
  }

  viewQrAddress(staticDataModal: any): void {
    this.modalReference = this.modalService.open(staticDataModal, {
      keyboard: false,
      centered: true,
      windowClass: 'modal-holder',
    });
  }

  closePopup() {
    this.modalReference.close();
  }
}
