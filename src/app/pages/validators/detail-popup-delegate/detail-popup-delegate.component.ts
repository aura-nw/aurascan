import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DIALOG_STAKE_MODE } from '../../../../app/core/constants/validator.enum';
import { Globals } from '../../../global/global';
;

@Component({
  selector: 'detail-popup-delegate',
  templateUrl: './detail-popup-delegate.component.html',
  styleUrls: ['./detail-popup-delegate.component.scss'],
})
export class DetailPopupDelegateComponent implements OnInit {
  @Input() data: any;

  amountFormat: string | number;
  delegatedToken = 0;
  availableToken = 0;
  stakingToken = 0;
  totalDelegator = 0;
  isExceedAmount = false;
  dialogMode = DIALOG_STAKE_MODE;

  constructor(
    public translate: TranslateService,
    public global: Globals,
  ) {}

  ngOnInit(): void {}

  getMaxToken(): void{
    this.amountFormat = this.availableToken;
  }

  resetCheck() {
    this.isExceedAmount = false;
  }
}
