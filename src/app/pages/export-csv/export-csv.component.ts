import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { ExportFileName, TabsAccount, TabsAccountLink } from 'src/app/core/constants/account.enum';
import { DATEFORMAT, STORAGE_KEYS } from 'src/app/core/constants/common.constant';
import { EWalletType } from 'src/app/core/constants/wallet.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { UserService } from 'src/app/core/services/user.service';
import {
  convertBech32AddressToEvmAddress,
  convertEvmAddressToBech32Address,
  transferAddress,
} from 'src/app/core/utils/common/address-converter';
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
  isValidEvmAddress = true;
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
  prefix = this.environmentService.chainInfo.bech32Config.bech32PrefixAccAddr?.toLowerCase();
  chainInfo = this.environmentService.chainInfo;
  evmPrefix = EWalletType;

  destroyed$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    public commonService: CommonService,
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
      evmAddress: ['', [Validators.required]],
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
    const { accountAddress, accountEvmAddress } = transferAddress(
      this.chainInfo.bech32Config.bech32PrefixAccAddr,
      data['address'],
    );

    this.csvForm.controls.address.setValue(accountAddress);
    this.csvForm.controls.evmAddress.setValue(accountEvmAddress);
    if (this.commonService.isValidAddress(data['address'])) {
      this.csvForm.get('evmAddress').disable();
    } else {
      this.csvForm.get('address').disable();
    }

    this.dataType = data['exportType'];
  }

  mappingDataExport(dataType) {
    switch (dataType) {
      case TabsAccountLink.EVMExecutedTxs:
        return this.TabsAccount.EVMExecutedTxs;
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
    let { addressDefault, address, dataType, displayPrivate, endDate, fromBlock, startDate, toBlock } =
      this.csvForm.getRawValue();
    addressDefault = address;

    if (startDate || endDate) {
      startDate = moment(startDate).startOf('day').toISOString();
      endDate = moment(endDate).endOf('day').toISOString();
    }

    // send both evm + native address for execute + evm execute
    if (this.dataType === this.TabsAccountLink.ExecutedTxs || this.dataType === this.TabsAccountLink.EVMExecutedTxs) {
      const addressNative = convertEvmAddressToBech32Address(this.chainInfo.bech32Config.bech32PrefixAccAddr, address);
      const evmAddress = convertBech32AddressToEvmAddress(
        this.chainInfo.bech32Config.bech32PrefixAccAddr,
        addressNative,
      );
      address = `${addressNative},${evmAddress}`;
    }

    let payload = {
      addressDefault: addressDefault.toLowerCase(),
      dataType: this.dataType,
      address: address.toLowerCase(),
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
    let nameTab;
    switch (payload.dataType) {
      case TabsAccountLink.EVMExecutedTxs:
        nameTab = ExportFileName.EVMExecutedTxs;
        break;
      case TabsAccountLink.NativeTxs:
        nameTab = ExportFileName.NativeTxs;
        break;
      case TabsAccountLink.FtsTxs:
        nameTab = ExportFileName.FtsTxs;
        break;
      case TabsAccountLink.NftTxs:
        nameTab = ExportFileName.NftTxs;
        break;
      default:
        nameTab = ExportFileName.ExecutedTxs;
        break;
    }
    const data: Blob = new Blob([buffer], {
      type: 'text/csv;charset=utf-8',
    });

    const fileName =
      'export-account-' +
      (payload.dataType === TabsAccountLink.NativeTxs ? 'native-ibc-transfer' : nameTab) +
      '-' +
      payload.addressDefault +
      '.csv';
    saveAs(data, fileName);
    this.isDownload = false;
    this.isValidCaptcha = false;
    this.responseCaptcha = grecaptcha.reset();
  }

  get getAddress() {
    return this.csvForm?.get('address');
  }

  get getEvmAddress() {
    return this.csvForm?.get('evmAddress');
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

  resetData() {
    this.formInit();
    this.dataType = '';
    this.isFilterDate = true;
  }

  getReponseCaptcha() {
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

  clearAddress() {
    this.csvForm.controls.address.setValue('');
    this.csvForm.controls.evmAddress.setValue('');
    this.csvForm.get('address').enable();
    this.csvForm.get('evmAddress').enable();
  }

  setAddressOther(address) {
    this.isValidAddress = true;
    this.isValidEvmAddress = true;

    if (address.startsWith(EWalletType.EVM) && !this.commonService.isValidEvmAddress(address)) {
      this.csvForm.controls.address.setValue('');
      this.isValidEvmAddress = false;
      return;
    } else if (address.startsWith(this.prefix) && !this.commonService.isValidAddress(address)) {
      this.csvForm.controls.evmAddress.setValue('');
      this.isValidAddress = false;
      return;
    }

    if (address.length > 0) {
      if (this.commonService.isValidAddress(address)) {
        this.csvForm.get('evmAddress').disable();
      } else {
        this.csvForm.get('address').disable();
      }
    }

    if (!this.commonService.isValidContract(address)) {
      const { accountAddress, accountEvmAddress } = transferAddress(
        this.chainInfo.bech32Config.bech32PrefixAccAddr,
        address,
      );
      this.csvForm.controls.address.setValue(accountAddress);
      if (accountEvmAddress) {
        this.csvForm.controls.evmAddress.setValue(accountEvmAddress);
      }
    }
  }
}
