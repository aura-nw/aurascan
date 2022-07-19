import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
export class PopupDelegateComponent implements OnInit, OnChanges {
  @Input() data: any;

  availableToken = 0;
  dialogMode = DIALOG_STAKE_MODE;
  timeStaking = `${this.environmentService.configValue.timeStaking}`;

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  constructor(
    public translate: TranslateService,
    public global: Globals,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.timeStaking = (Number(this.timeStaking) / DATE_TIME_WITH_MILLISECOND).toString();
    this.availableToken = +this.data?.availableToken + +this.data?.delegatableVesting;
  }

  ngOnChanges(changes: SimpleChanges): void {
  }
}
