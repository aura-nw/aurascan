import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { saveAs } from 'file-saver';
import { Subject, takeUntil } from 'rxjs';
import { TabsAccount, TabsAccountLink } from 'src/app/core/constants/account.enum';
import { DATEFORMAT, STORAGE_KEYS } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { UserService } from 'src/app/core/services/user.service';
import local from 'src/app/core/utils/storage/local';

declare var grecaptcha: any;

@Component({
  selector: 'app-export-csv',
  templateUrl: './export-csv.component.html',
  styleUrls: ['./export-csv.component.scss'],
})
export class ExportCsvComponent implements OnInit, OnDestroy {
  csvForm: FormGroup;
  isError = false;
  isFilterDate = true;
  isValidAddress = true;
  isValidBlock = true;
  userEmail;
  TabsAccount = TabsAccount;
  dataType = '';
  minDate;
  minDateEnd;
  maxDate;
  maxDateEnd;
  TabsAccountLink = TabsAccountLink;
  isDownload = false;
  responseCaptcha;
  isValidCaptcha = false;
  siteKey = this.environmentService.siteKeyCaptcha;

  destroyed$ = new Subject<void>();
  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private datePipe: DatePipe,
    private toastr: NgxToastrService,
    private environmentService: EnvironmentService,
    private userService: UserService,
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.userService.user$.pipe(takeUntil(this.destroyed$)).subscribe((user) => {
      // check exit email
      this.userEmail = user?.email;
    });

    this.renderCaptcha();
    this.formInit();

    //get data config from account detail
    const dataConfig = local.getItem<[]>(STORAGE_KEYS.SET_DATA_EXPORT);

    if (dataConfig?.length > 0) {
      this.setDataConfig(dataConfig);
    }

    this.minDate = this.minDateEnd = new Date(2023, 2, 20);
    this.maxDate = this.maxDateEnd = new Date().toISOString().slice(0, 10);
  }

  formInit() {
    this.csvForm = this.formBuilder.group({
      dataType: null,
      address: ['', [Validators.required]],
      isFilterDate: true,
      startDate: null,
      endDate: null,
      fromBlock: null,
      toBlock: null,
      displayPrivate: [
        {
          value: false,
          disabled: !!!this.userEmail,
        },
      ],
    });
  }

  setDataConfig(dataConfig) {
    const data = JSON.parse(dataConfig);
    this.csvForm.controls.address.setValue(data['address']);
    this.dataType = data['exportType'];
  }

  mappingDataExport(dataType) {
    switch (dataType) {
      case TabsAccountLink.NativeTxs:
        return this.TabsAccount.NativeTxs;
      case TabsAccountLink.FtsTxs:
        return this.TabsAccount.FtsTxs;
      case TabsAccountLink.NftTxs:
        return this.TabsAccount.NftTxs;
      default:
        return this.TabsAccount.ExecutedTxs;
    }
  }

  downloadCSV(responseCaptcha) {
    //return if downloading
    if (this.isDownload) {
      return;
    }
    this.csvForm.value.dataType = this.dataType;
    this.csvForm.value.isFilterDate = this.isFilterDate;
    let { address, dataType, displayPrivate, endDate, fromBlock, startDate, toBlock } = this.csvForm.value;

    if (startDate || endDate) {
      startDate = this.getConvertDate(startDate);
      endDate = this.getConvertDate(endDate, true);
    }

    let payload = {
      dataType: dataType,
      address: address,
      dataRangeType: this.isFilterDate ? 'date' : 'height',
      min: this.isFilterDate ? startDate : fromBlock,
      max: this.isFilterDate ? endDate : toBlock,
      responseCaptcha: responseCaptcha,
    };

    this.isDownload = true;
    this.commonService.exportCSV(payload, displayPrivate).subscribe({
      next: (res) => {
        this.handleDownloadFile(res, payload);
      },
      error: (err) => {
        this.isDownload = false;
        if (err.error instanceof Blob) {
          this.displayError(err);
        } else {
          this.toastr.error('Error when download, try again later');
        }
      },
    });
  }

  displayError(err) {
    return new Promise<any>((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = (e: Event) => {
        try {
          const errMsg = JSON.parse((<any>e.target).result)?.error;
          if (errMsg?.statusCode === 401 && errMsg?.message == 'Unauthorized') {
            if (this.csvForm.value.displayPrivate) {
              local.removeItem(STORAGE_KEYS.USER_DATA);
              local.removeItem(STORAGE_KEYS.LIST_NAME_TAG);
              window.location.reload();
            }
          } else {
            this.toastr.error(errMsg?.message);
          }
        } catch (e) {
          reject(err);
        }
      };
      reader.onerror = (e) => {
        reject(err);
      };
      reader.readAsText(err.error);
    });
  }

  handleDownloadFile(buffer, payload) {
    const data: Blob = new Blob([buffer], {
      type: 'text/csv;charset=utf-8',
    });
    const fileName = 'export-account-' + payload.dataType + '-' + payload.address + '.csv';
    saveAs(data, fileName);
    this.isDownload = false;
    this.isValidCaptcha = false;
    this.responseCaptcha = grecaptcha.reset();
  }

  get getAddress() {
    return this.csvForm.get('address');
  }

  setDateRange() {
    this.maxDateEnd = new Date().toISOString().slice(0, 10);
    this.minDate = new Date(2023, 2, 20);
    this.maxDate = this.datePipe.transform(this.csvForm.value?.endDate, DATEFORMAT.DATE_ONLY) || this.maxDate;
    this.minDateEnd = this.datePipe.transform(this.csvForm.value?.startDate, DATEFORMAT.DATE_ONLY) || this.minDate;
  }

  changeType(isFilterDate = false) {
    this.isFilterDate = isFilterDate;
    this.csvForm.value.isFilterDate = this.isFilterDate;
    this.checkFormValid();
  }

  changeTypeFilter(type) {
    this.dataType = type;
    this.csvForm.value.dataType = this.dataType;
    if (type !== this.TabsAccountLink.ExecutedTxs) {
      this.isFilterDate = true;
      this.csvForm.value.isFilterDate = this.isFilterDate;
    }
    this.checkFormValid();
  }

  checkFormValid(): boolean {
    this.getAddress.setValue(this.getAddress?.value?.trim());
    const { address, endDate, fromBlock, startDate, toBlock } = this.csvForm.value;

    this.isValidBlock = true;

    if (this.commonService.isBech32Address(address)) {
      this.isValidAddress = true;
    } else {
      this.isValidAddress = false;
      return false;
    }

    //check null/invalid block
    if (!this.isFilterDate) {
      if (!fromBlock || !toBlock) {
        return false;
      } else if (+fromBlock > +toBlock) {
        this.isValidBlock = false;
        return false;
      }
    } else if (this.isFilterDate && (!startDate || !endDate)) {
      return false;
    }

    //check null export data type
    if (!this.dataType) {
      return false;
    }

    if (this.isDownload) {
      return false;
    }

    //check valid captcha
    if (!this.isValidCaptcha) {
      return false;
    }

    return true;
  }

  getConvertDate(date, lastDate = false) {
    if (!date) {
      return null;
    }

    let temp = this.datePipe.transform(date, DATEFORMAT.DATE_ONLY);
    let subStringDate = lastDate ? 'T24:00:000Z' : 'T00:00:000Z';
    return temp + subStringDate;
  }

  resetData() {
    this.formInit();
    this.dataType = '';
    this.isFilterDate = true;
  }

  getResponseCaptcha() {
    this.downloadCSV(grecaptcha.getResponse(this.responseCaptcha));
  }

  verifyCallback() {
    this.isValidCaptcha = true;
    this.checkFormValid();
  }

  errorCallback() {
    this.isValidCaptcha = false;
    this.checkFormValid();
  }

  renderCaptcha() {
    this.responseCaptcha = grecaptcha.render('box_recaptcha', {
      sitekey: this.siteKey,
      callback: this.verifyCallback.bind(this),
      theme: 'dark',
      'expired-callback': this.errorCallback.bind(this),
      'error-callback': this.errorCallback.bind(this),
    });
  }
}
