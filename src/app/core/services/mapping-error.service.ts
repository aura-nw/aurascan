import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DATE_TIME_WITH_MILLISECOND } from '../constants/common.constant';
import { MESSAGES_CODE_PROPOSAL, MESSAGES_CODE_STAKING } from '../constants/messages.constant';
import { CodeTransaction } from '../constants/transaction.enum';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class MappingErrorService extends CommonService {
  apiUrl = `${this.environmentService.configValue.beUri}`;
  timeStaking = `${this.environmentService.configValue.timeStaking}`;

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
    public translate: TranslateService,
  ) {
    super(http, environmentService);
    this.timeStaking = (Number(this.timeStaking) / DATE_TIME_WITH_MILLISECOND).toString();
  }

  checkMappingError(message, code, isProposal = false) {
    if (code === CodeTransaction.Success) {
      message = this.translate.instant('NOTICE.SUCCESS_TRANSACTION');
      return message;
    }
    let temp = MESSAGES_CODE_STAKING[code]?.Message || 'error';
    if (isProposal) {
      temp = MESSAGES_CODE_PROPOSAL[code]?.Message || 'error';
    }
    message = temp ? temp.charAt(0).toUpperCase() + temp.slice(1) : 'Error';
    return message;
  }
}
