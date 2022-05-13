import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DATE_TIME_WITH_MILLISECOND } from '../../../core/constants/common.constant';
import { EnvironmentService } from '../../../core/data-services/environment.service';
import { DIALOG_STAKE_MODE } from '../../../core/constants/validator.enum';
import { Globals } from '../../../global/global';

@Component({
  selector: 'popup-delegate',
  templateUrl: './popup-delegate.component.html',
  styleUrls: ['./popup-delegate.component.scss'],
})
export class PopupDelegateComponent implements OnInit {
  @Input() data: any;

  amountFormat: string | number;
  delegatedToken = 0;
  availableToken = 0;
  stakingToken = 0;
  totalDelegator = 0;
  isExceedAmount = false;
  dialogMode = DIALOG_STAKE_MODE;
  timeStaking = `${this.environmentService.apiUrl.value.timeStaking}`;

  constructor(
    public translate: TranslateService,
    public global: Globals,
    private environmentService: EnvironmentService
  ) {}

  ngOnInit(): void {
    this.timeStaking = (Number(this.timeStaking) / DATE_TIME_WITH_MILLISECOND).toString();
  }

  getMaxToken(): void{
    this.amountFormat = this.availableToken;
  }

  resetCheck() {
    this.isExceedAmount = false;
  }
}
