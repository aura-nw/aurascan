import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';;
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../../global/global';
import { DIALOG_STAKE_MODE } from '../../../../app/core/constants/validator.enum';

@Component({
  selector: 'detail-popup-delegate',
  templateUrl: './detail-popup-delegate.component.html',
  styleUrls: ['./detail-popup-delegate.component.scss'],
})
export class DetailPopupDelegateComponent implements OnInit {
  @Input() data: any;

  amountFormat;
  delegatedToken = 0;
  availableToken = 0;
  stakingToken = 0;
  totalDelegator = 0;
  isExceedAmount = false;
  dialogMode = DIALOG_STAKE_MODE;

  constructor(
    public translate: TranslateService,
    private route: Router,
    private datePipe: DatePipe,
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
