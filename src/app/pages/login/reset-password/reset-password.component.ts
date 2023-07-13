import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  emailFormat = '';
  resetForm;
  data;
  mode = 'default';
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    let email = 'tetelrel@gmail.com';
    const tempChar = email.indexOf('@');
    let strStart = email.substring(0, 3) + '***';
    if (tempChar <= 3) {
      strStart = email.substring(0, tempChar);
    }
    this.emailFormat = strStart + email.substring(tempChar);

    this.formInit();
  }

  get getPassword() {
    return this.resetForm?.get('password');
  }

  get getConfirmPassword() {
    return this.resetForm?.get('confirmPassword');
  }

  formInit() {
    this.resetForm = this.fb.group({
      password: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$'),
        ],
      ],
      confirmPassword: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  onSubmit() {}
}
