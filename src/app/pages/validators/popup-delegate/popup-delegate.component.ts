import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DATE_TIME_WITH_MILLISECOND } from '../../../core/constants/common.constant';
import { DIALOG_STAKE_MODE } from '../../../core/constants/validator.enum';
import { EnvironmentService } from '../../../core/data-services/environment.service';

@Component({
  selector: 'popup-delegate',
  templateUrl: './popup-delegate.component.html',
  styleUrls: ['./popup-delegate.component.scss'],
})
export class PopupDelegateComponent implements OnInit {
  @Input() data: any;
  boxNoticeShow = false;
  availableToken = 0;
  dialogMode = DIALOG_STAKE_MODE;
  timeStaking = `${this.environmentService.stakingTime}`;

  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  constructor(public translate: TranslateService, private environmentService: EnvironmentService) {}

  ngOnInit(): void {
    this.timeStaking = (Number(this.timeStaking) / DATE_TIME_WITH_MILLISECOND).toString();
    this.availableToken = +this.data?.availableToken + +this.data?.delegableVesting;
  }
}
