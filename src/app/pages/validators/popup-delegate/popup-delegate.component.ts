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
  availableToken = 0;
  dialogMode = DIALOG_STAKE_MODE;
  timeStaking = `${this.environmentService.apiUrl.value.timeStaking}`;

  constructor(
    public translate: TranslateService,
    public global: Globals,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.timeStaking = (Number(this.timeStaking) / DATE_TIME_WITH_MILLISECOND).toString();
    this.availableToken = this.data?.availableToken + this.data?.delegatable_vesting;
  }
}
