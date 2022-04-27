import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CodeTransaction } from '../constants/transaction.enum';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class MappingErrorService extends CommonService {
  apiUrl = `${this.environmentService.apiUrl.value.cosmos}`;

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
    public translate: TranslateService
  ) {
    super(http, environmentService);
  }

  checkMappingError(message, code){
    if (code === CodeTransaction.Success) {
      message = this.translate.instant('NOTICE.SUCCESS_TRANSACTION');
      return message;
    }
    if (message.indexOf('too many redelegation') >= 0) {
      message = this.translate.instant('NOTICE.ERROR_REDELEGATE_TIME');
    } else if (message.indexOf('in progress') >= 0) {
      message = this.translate.instant('NOTICE.ERROR_REDELEGATE_INPROGRESS');
    } else if (message.indexOf('too many unbonding') >= 0) {
      message = this.translate.instant('NOTICE.ERROR_UNDELEGATE_TIME');
    } else {
      const arr = ['claim reward', 'delegate', 'redelegate', 'undelegate'];
      const contains = arr.some(element => {
        if (message.includes(element)) {
          message = 'claim reward/delegate/ redelegate/undelegate unsuccessfully';
          return message;
        }
      });
    }
    return message;
  }
}
