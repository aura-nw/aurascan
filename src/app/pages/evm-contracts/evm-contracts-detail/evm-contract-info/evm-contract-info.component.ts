import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ENameTag, EScreen} from 'src/app/core/constants/account.enum';
import {LENGTH_CHARACTER} from 'src/app/core/constants/common.constant';

@Component({
  selector: 'app-evm-contract-info',
  templateUrl: './evm-contract-info.component.html',
  styleUrls: ['./evm-contract-info.component.scss'],
})
export class EvmContractInfoComponent implements OnChanges {
  @Input() type: 'information' | 'moreInfo' = 'information';
  @Input() contractDetail: any;

  lengthNormalAddress = LENGTH_CHARACTER.ADDRESS;
  ENameTag = ENameTag;
  EScreen = EScreen;

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.contractDetail.address)
  }
}
