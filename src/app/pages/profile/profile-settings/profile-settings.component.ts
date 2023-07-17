import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

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
      old_password: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$'),
        ],
      ],
      new_password: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$'),
        ],
      ],
      cf_new_password: [''],
    });
  }
}
