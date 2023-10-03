import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TabsAccount } from 'src/app/core/constants/account.enum';
import { DATEFORMAT } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { isAddress, isContract } from 'src/app/core/utils/common/validation';

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

  constructor(
    private fb: FormBuilder,
    private router: ActivatedRoute,
    private route: Router,
    private environmentService: EnvironmentService,
    private toastr: NgxToastrService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    // check exit email
    this.userEmail = localStorage.getItem('userEmail');

    this.minDate = this.minDateEnd = new Date(2023, 2, 20);
    this.maxDate = this.maxDateEnd = new Date().toISOString().slice(0, 10);
    this.formInit();
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

  downloadCSV() {
    this.csvForm.value.dataType = this.dataType;
    this.csvForm.value.isFilterDate = this.isFilterDate;
    console.log(this.csvForm.value);
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
    let { address, dataType, displayPrivate, endDate, fromBlock, startDate, toBlock } = this.csvForm.value;

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
    }

    //check null start date + end date
    if ((this.isFilterDate && !startDate) || !endDate) {
      return false;
    }

    //check null export data type
    if (!this.dataType) {
      return false;
    }

    return true;
  }
}
