import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss'],
})
export class ProfileSettingsComponent implements OnInit {
  changePassForm;
  hideOldPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.formInit();
  }

  formInit() {
    this.changePassForm = this.fb.group({
      expiration_time: [''],
      period_amount: [''],
      period_day: [''],
      isInstantiate: false,
      isExecute: false,
      execute_contract: this.fb.array([]),
    });
    // this.addContracts();
  }
}
