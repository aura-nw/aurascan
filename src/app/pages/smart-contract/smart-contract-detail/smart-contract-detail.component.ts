import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CodeTransaction, StatusTransaction } from '../../../../app/core/constants/transaction.enum';
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
  countCurrent: string = '';
  tokenTransferList: any[];
  token: string = '';
  loading = true;
  typeTransaction = TYPE_TRANSACTION;
  textSearch: string = '';
  codeTransaction = CodeTransaction;
  tokenType = 'Aura';
  tokenAddress = '0xb8c77482e45f1f44de1745f52c74426c631bdd52';

  constructor(private smartContractService: SmartContractService) {}

  ngOnInit(): void {
    this.getDataTable();
  }

  getDataTable(): void {
    this.smartContractService.getListTokenTransfer(this.token).subscribe((res) => {
      this.loading = true;
      if (res) {
        this.tokenTransferList = [...res];
        this.tokenTransferList.forEach((token) => {
          token.status = StatusTransaction.Fail;
          if (token?.code == CodeTransaction.Success) {
            token.status = StatusTransaction.Success;
          }
          token.from_address_format = token.from_address.replace(token.from_address.substring(20), '...');
          token.to_address_format = token.to_address.replace(token.to_address.substring(20), '...');
          token.price = token.amount * 0.5;
          const typeTrans = this.typeTransaction.find((f) => f.label.toLowerCase() === token.type.toLowerCase());
          token.type = typeTrans?.value;
        });
      }
      this.loading = false;
    });
  }

  searchTokenTable(): void {}
}
