import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DATE_TIME_WITH_MILLISECOND, TIME_OUT_CALL_API } from '../constants/common.constant';
import { MESSAGES_CODE_PROPOSAL, MESSAGES_CODE_SDK, MESSAGES_CODE_STAKING, TYPE_CODE_SPACE } from '../constants/messages.constant';
import { CodeTransaction } from '../constants/transaction.enum';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';
import { NgxToastrService } from './ngx-toastr.service';
import { TransactionService } from './transaction.service';

@Injectable()
export class MappingErrorService extends CommonService {
  apiUrl = `${this.environmentService.configValue.beUri}`;
  timeStaking = `${this.environmentService.configValue.timeStaking}`;

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
    public translate: TranslateService,
    private transactionService: TransactionService,
    private toastr: NgxToastrService,
  ) {
    super(http, environmentService);
    this.timeStaking = (Number(this.timeStaking) / DATE_TIME_WITH_MILLISECOND).toString();
  }

  checkMappingError(message, code, codeSpace = TYPE_CODE_SPACE.SDK) {
    if (code === CodeTransaction.Success) {
      message = this.translate.instant('NOTICE.SUCCESS_TRANSACTION');
      return message;
    }

    let codeTemp = code;
    if (+code !== parseInt(code, 10)) {
      const index = code.indexOf('code');
      if (index) {
        // get value of code from string
        codeTemp = code.slice(index + 5, index + 8).trim();
      }
    }

    let temp = 'Error';
    switch (codeSpace) {
      case TYPE_CODE_SPACE.GOV:
        temp = MESSAGES_CODE_STAKING[codeTemp]?.Message;
        break;
      case TYPE_CODE_SPACE.STAKING:
        temp = MESSAGES_CODE_STAKING[codeTemp]?.Message;
        break;
      default:
        temp = MESSAGES_CODE_SDK[codeTemp]?.Message;
        break;
    }

    message = temp ? temp.charAt(0).toUpperCase() + temp.slice(1) : code;
    return message;
  }

  checkMappingErrorTxDetail(message, code) {
    if (code === CodeTransaction.Success) {
      message = this.translate.instant('NOTICE.SUCCESS_TRANSACTION');
      return message;
    }
    if (message.indexOf('too many redelegation') >= 0) {
      message = this.translate.instant('NOTICE.ERROR_REDELEGATE_TIME');
    } else if (message.indexOf('in progress') >= 0) {
      message = this.translate.instant('NOTICE.ERROR_REDELEGATE_INPROGRESS', { timeStaking: this.timeStaking });
    } else if (message.indexOf('too many unbonding') >= 0) {
      message = this.translate.instant('NOTICE.ERROR_UNDELEGATE_TIME');
    } else if (code && code !== CodeTransaction.Success) {
      const arr = ['claim reward', 'delegate', 'redelegate', 'undelegate'];
      const contains = arr.some((element) => {
        if (message.includes(element)) {
          message = 'claim reward/delegate/redelegate/undelegate unsuccessfully';
          return message;
        }
      });
    }
    return message;
  }

  async checkDetailTx(id) {
    const res = await this.transactionService.txsDetailLcd(id);
    let numberCode = res?.data?.tx_response?.code;
    let message = res?.data?.tx_response?.raw_log;
    message = this.checkMappingError(message, numberCode, res?.data?.tx_response?.codespace);
    if (numberCode !== undefined) {
      if (!!!numberCode && numberCode === CodeTransaction.Success) {
        message = this.translate.instant('NOTICE.SUCCESS_TRANSACTION');
        this.toastr.success(message);
        setTimeout(() => {}, TIME_OUT_CALL_API);
      } else {
        this.toastr.error(message);
      }
    }
  }
}
