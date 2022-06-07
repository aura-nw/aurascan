import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ResponseDto } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';

@Component({
  selector: 'app-read-contract',
  templateUrl: './read-contract.component.html',
  styleUrls: ['./read-contract.component.scss'],
})
export class ReadContractComponent implements OnInit {
  @Input() contractDetailData: any;

  isExpand = false;
  jsonReadContract: any;
  idRead: string;

  constructor(private contractService: ContractService) {}

  ngOnInit(): void {
    this.jsonReadContract = JSON.parse(this.contractDetailData?.query_msg_schema);
  }

  expandMenu(closeAll = false): void {
    for (let i = 0; i < document.getElementsByClassName('content-contract').length; i++) {
      let element: HTMLElement = document.getElementsByClassName('content-contract')[i] as HTMLElement;
      let expand = element.getAttribute('aria-expanded');
      if (closeAll) {
        if (expand == 'true') {
          element.click();
        }
      } else {
        if (expand === this.isExpand.toString()) {
          element.click();
        }
      }
    }
    if (!closeAll) {
      this.isExpand = !this.isExpand;
    }
  }

  reloadData() {
    for (let i = 0; i < document.getElementsByClassName('form-check-input').length; i++) {
      (<HTMLInputElement>document.getElementsByClassName('form-check-input')[i]).value = '';
    }
    this.expandMenu(true);
  }

  querySmartContract(name: string) {
    let msg = { [name]: { id: this.idRead } };
    let queryData = {
      contract_address: this.contractDetailData?.contract_address,
      query_msg: msg,
    };
    this.contractService.readContract(queryData).subscribe((res: ResponseDto) => {
      // console.log(res);
    });
  }
}
