import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';

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
  isValidAddress = false;
  userEmail;

  constructor(
    private fb: FormBuilder,
    private router: ActivatedRoute,
    private route: Router,
    private environmentService: EnvironmentService,
    private toastr: NgxToastrService,
  ) {}

  ngOnInit(): void {
    this.formInit();
    // check exit email
    this.userEmail = localStorage.getItem('userEmail');
  }

  formInit() {
    this.csvForm = this.fb.group({
      dataType: null,
      address: ['', [Validators.required]],
      isFilterDate: true,
      starDate: null,
      endDate: null,
      blockFrom: null,
      blockTo: null,
      displayPrivate: false,
    });

    console.log(this.csvForm);
  }

  onSubmit() {
    console.log(this.csvForm.value);
    
  }

  setDateRange() {}

  changeDisplayPrivate() {}

  changeType(isFilterDate = false) {
    this.isFilterDate = isFilterDate;
    this.csvForm.isFilterDate = this.isFilterDate;
  }
}
