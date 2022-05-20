import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TOKEN_TAB } from '../../../../app/core/constants/smart-contract.constant';
import { TokenTab } from '../../../../app/core/constants/smart-contract.enum';
import { TYPE_TRANSACTION } from '../../../../app/core/constants/transaction.constant';
import { SmartContractService } from '../../../../app/core/services/smart-contract.service';

@Component({
  selector: 'app-smart-contract-detail',
  templateUrl: './smart-contract-detail.component.html',
  styleUrls: ['./smart-contract-detail.component.scss'],
})
export class SmartContractDetailComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {
  }
}
