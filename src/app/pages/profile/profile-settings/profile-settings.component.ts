import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss'],
})
export class ProfileSettingsComponent implements OnInit {
  userEmail = null;
  changePassForm;
  hideOldPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  isSubmit = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private userService: UserService, private toastr: NgxToastrService) {}

  ngOnInit(): void {
    this.userEmail = localStorage.getItem('userEmail').replace(/"/g, '');
    this.formInit();
  }

  get getOldPassword() {
    return this.changePassForm.get('old_password');
  }

  get getNewPassword() {
    return this.changePassForm.get('new_password');
  }

  get getConfirmPassword() {
    return this.changePassForm.get('cf_new_password');
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
      cf_new_password: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  onSubmit() {
    this.isSubmit = true;
    let payload = {
      oldPassword: this.changePassForm.value?.old_password,
      password: this.changePassForm.value?.new_password,
      passwordConfirmation: this.changePassForm.value?.cf_new_password,
    };
    this.userService.changePassword(payload).subscribe({
      next: (res) => {
        this.toastr.successWithTitle('Please use the new password next time you log in.', 'Password changed');
      },
      error: (error) => {
        this.toastr.error(error?.details?.message);
      },
    });
  }
}
