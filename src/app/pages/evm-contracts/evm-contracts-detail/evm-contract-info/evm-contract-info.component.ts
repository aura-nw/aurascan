import {Component, Input} from '@angular/core';
import {LENGTH_CHARACTER} from "src/app/core/constants/common.constant";
import {ENameTag, EScreen} from 'src/app/core/constants/account.enum';

@Component({
  selector: 'app-evm-contract-info',
  templateUrl: './evm-contract-info.component.html',
  styleUrls: ['./evm-contract-info.component.scss']
})
export class EvmContractInfoComponent {
  @Input() type: 'information' | 'moreInfo' = 'information';
  @Input() contractDetail: any;
  lengthNormalAddress = LENGTH_CHARACTER.ADDRESS;
  ENameTag = ENameTag;
  EScreen = EScreen;
}
