import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TabsAccount, TabsAccountLink } from 'src/app/core/constants/account.enum';
import { DATEFORMAT } from 'src/app/core/constants/common.constant';
import { CommonService } from 'src/app/core/services/common.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { isAddress, isContract } from 'src/app/core/utils/common/validation';
import {saveAs} from "file-saver";

@Component({
  selector: 'app-export-csv',
  templateUrl: './export-csv.component.html',
  styleUrls: ['./export-csv.component.scss'],
})
export class ExportCsvComponent implements OnInit {
  csvForm;
  isError = false;
  isFilterDate = true;
  dateStart;
  dateEnd;
  isValidAddress = true;
  isValidBlock = true;
  userEmail;
  tabsAccount = TabsAccount;
  dataType = '';
  minDate;
  minDateEnd;
  maxDate;
  maxDateEnd;
  tabsData = TabsAccountLink;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private toastr: NgxToastrService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.formInit();

    // check exit email
    this.userEmail = localStorage.getItem('userEmail');

    //get data config from account detail
    const dataConfig = localStorage.getItem('setDataExport');
    console.log(dataConfig);

    if (dataConfig?.length > 0) {
      this.setDataConfig(dataConfig);
    }

    this.minDate = this.minDateEnd = new Date(2023, 2, 20);
    this.maxDate = this.maxDateEnd = new Date().toISOString().slice(0, 10);
  }

  formInit() {
    this.csvForm = this.fb.group({
      dataType: null,
      address: ['', [Validators.required]],
      isFilterDate: true,
      startDate: null,
      endDate: null,
      fromBlock: null,
      toBlock: null,
      displayPrivate: false,
    });
  }

  setDataConfig(dataConfig) {
    const data = JSON.parse(dataConfig);
    this.csvForm.controls.address.value = data['address'];
    this.dataType = data['exportType'];
  }

  mappingDataExport(dataType) {
    switch (dataType) {
      case this.tabsData.AuraTxs:
        return this.tabsAccount.AuraTxs;
      case this.tabsData.FtsTxs:
        return this.tabsAccount.FtsTxs;
      case this.tabsData.NftTxs:
        return this.tabsAccount.NftTxs;
      default:
        return this.tabsAccount.ExecutedTxs;
    }
  }

  downloadCSV() {
    this.csvForm.value.dataType = this.dataType;
    this.csvForm.value.isFilterDate = this.isFilterDate;
    console.log(this.csvForm.value);

    const { address, dataType, displayPrivate, endDate, fromBlock, startDate, toBlock } = this.csvForm.value;

    let payload = {
      dataType: dataType,
      address: address,
      dataRangeType: this.isFilterDate ? 'date' : 'height',
      min: this.isFilterDate ? startDate : fromBlock,
      max: this.isFilterDate ? endDate : toBlock,
    };

    this.commonService.exportCSV(payload).subscribe((buffer) => {
      console.log(buffer);
      
      const data: Blob = new Blob([buffer], {
        type: "text/csv;charset=utf-8"
      });
      // you may improve this code to customize the name 
      // of the export based on date or some other factors
      saveAs(data, "products.csv");
    });
    //   // saveAs(resp, `file.csv`)
    // });
  }

  get getAddress() {
    return this.csvForm.get('address');
  }

  get getFromBlock() {
    return this.csvForm.get('fromBlock');
  }

  get getToBlock() {
    return this.csvForm.get('toBlock');
  }

  setDateRange() {
    this.maxDateEnd = new Date().toISOString().slice(0, 10);
    this.minDate = new Date(2023, 2, 20);
    this.maxDate = this.datePipe.transform(this.csvForm.value?.endDate, DATEFORMAT.DATE_ONLY) || this.maxDate;
    this.minDateEnd = this.datePipe.transform(this.csvForm.value?.startDate, DATEFORMAT.DATE_ONLY) || this.minDate;
  }

  changeDisplayPrivate() {}

  changeType(isFilterDate = false) {
    this.isFilterDate = isFilterDate;
    this.csvForm.value.isFilterDate = this.isFilterDate;
    this.checkFormValid();
  }

  changeTypeFilter(type) {
    this.dataType = type;
    this.csvForm.value.dataType = this.dataType;
  }

  checkFormValid(): boolean {
    this.getAddress['value'] = this.getAddress?.value?.trim();
    const { address, dataType, displayPrivate, endDate, fromBlock, startDate, toBlock } = this.csvForm.value;

    this.isValidAddress = true;
    this.isValidBlock = true;

    if (address.length > 0) {
      if (!(isAddress(address) || isContract(address))) {
        this.isValidAddress = false;
        return false;
      }
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

    return true;
  }

  downloadCSV2(): void {
    // this.commonService.downloadCSV({
    //   search: this.search,
    //   sellerId: this.sellerId
    // }).subscribe((buffer) => {
    //   const data: Blob = new Blob([buffer], {
    //     type: "text/csv;charset=utf-8"
    //   });
    //   // you may improve this code to customize the name 
    //   // of the export based on date or some other factors
    //   saveAs(data, "products.csv");
    // });
  }
}
