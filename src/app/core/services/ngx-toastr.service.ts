import { Injectable } from '@angular/core';
import { ActiveToast, ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { MESSAGES_CODE } from '../constants/messages.constant';
import { ResponseTemplate } from '../models/common.model';

@Injectable({
  providedIn: 'root',
})
export class NgxToastrService {
  private POSITION_CLASS = 'toast-bottom-right';

  TIMEOUT_DEFAULT = 3000;

  constructor(private toastrService: ToastrService) {}

  success(message: string, title = '', configTimeOut = 3000): void {
    this.toastrService.success(message, title, {
      positionClass: this.POSITION_CLASS,
      timeOut: configTimeOut,
    });
  }

  successWithTap(message: string, title = ''): Observable<void> {
    return this.toastrService.success(message, title, {
      positionClass: this.POSITION_CLASS,
      timeOut: 20000,
    }).onTap;
  }

  error(message: string, title = '', configTimeOut = 3000): void {
    this.toastrService.error(message, title, {
      positionClass: this.POSITION_CLASS,
      timeOut: 20000,
    });
  }

  errorWithTap(message: string, title = ''): Observable<void> {
    return this.toastrService.error(message, title, {
      positionClass: this.POSITION_CLASS,
      timeOut: this.TIMEOUT_DEFAULT,
    }).onTap;
  }

  errorApi(response: ResponseTemplate<any>, title = '', configTimeOut = 3000): void {
    const message = MESSAGES_CODE[response.ErrorCode]?.Code ? MESSAGES_CODE[response.ErrorCode].Code : response.Message;
    this.toastrService.error(message, title, {
      positionClass: this.POSITION_CLASS,
      timeOut: configTimeOut,
    });
  }

  warning(message: string, title = '', configTimeOut = 3000): void {
    this.toastrService.warning(message, title, {
      positionClass: this.POSITION_CLASS,
      timeOut: configTimeOut,
    });
  }

  info(message: string, title = '', configTimeOut = 5000): void {
    if (this.toastrService.toasts.length === 0) {
      this.toastrService.info(message, title, {
        positionClass: this.POSITION_CLASS,
        enableHtml: true,
        closeButton: true,
        timeOut: configTimeOut,
        tapToDismiss: true,
      });
    }
  }

  loading(txHash: string, title = '', configTimeOut = 5000): void {
    if (this.toastrService.toasts.length === 0) {
      const message ='<a href="transaction/' + txHash + ' "target="_blank" class="toastr-link">Check your transaction on the explorer</a>';
      this.toastrService.info(message, 'Transaction is in progress', {
        positionClass: this.POSITION_CLASS,
        enableHtml: true,
        closeButton: true,
        timeOut: configTimeOut,
        tapToDismiss: true,
      });
    }
  }

  clear() {
    this.toastrService.clear();
  }
}
