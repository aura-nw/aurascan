import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MESSAGES_CODE } from '../constants/messages.constant';
import { ResponseTemplate } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class NgxToastrService {
  private positionClass = 'toast-bottom-right';

  constructor(private toastrService: ToastrService) { }

  success(message: string, title = '', configTimeOut = 3000): void {
    this.toastrService.success(message, title,
      {
        positionClass: this.positionClass,
        timeOut: configTimeOut
      });
  }

  error(message: string, title = '', configTimeOut = 3000): void {
    this.toastrService
      .error(message, title, {
        positionClass: this.positionClass,
        timeOut: configTimeOut
      });
  }

  errorApi(response: ResponseTemplate<any>, title = '', configTimeOut = 3000): void {
    const message = MESSAGES_CODE[response.ErrorCode]?.Code ? MESSAGES_CODE[response.ErrorCode].Code : response.Message;
    this.toastrService
      .error(message, title, {
        positionClass: this.positionClass,
        timeOut: configTimeOut
      });
  }

  warning(message: string, title = '', configTimeOut = 3000): void {
    this.toastrService
      .warning(message, title, {
        positionClass: this.positionClass,
        timeOut: configTimeOut
      });
  }

  info(message: string, title = '', configTimeOut = 3000): void {
    this.toastrService
      .info(message, title, {
        positionClass: this.positionClass,
        timeOut: configTimeOut
      });
  }
}
