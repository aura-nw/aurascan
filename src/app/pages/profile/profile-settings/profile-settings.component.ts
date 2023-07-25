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
  currentProvider = 'password';
  isError = false;

  constructor(private fb: FormBuilder, private userService: UserService, private toastr: NgxToastrService) {}

  ngOnInit(): void {
    this.userEmail = localStorage.getItem('userEmail')?.replace(/"/g, '');
    this.currentProvider = localStorage.getItem('provider')?.replace(/"/g, '');
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
        [Validators.maxLength(100), Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$')],
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

    // check required if type = password
    if (this.currentProvider != 'google') {
      this.changePassForm.controls['old_password'].setValidators([Validators.required]);
    }
  }

  onSubmit() {
    let payload = {
      oldPassword: this.changePassForm.value?.old_password,
      password: this.changePassForm.value?.new_password,
      passwordConfirmation: this.changePassForm.value?.cf_new_password,
    };
    this.userService.changePassword(payload).subscribe({
      next: (res) => {
        this.toastr.successWithTitle('Please use the new password next time you log in.', 'Password changed');

        if (this.currentProvider === 'google') {
          localStorage.setItem('provider', JSON.stringify('password'));
          setTimeout(() => {
            window.location.reload();
          }, 4000);
        }
      },
      error: (error) => {
        this.isError = true;
        if (error?.details?.message === 'Unauthorized') {
          const payload = {
            refreshToken: localStorage.getItem('refreshToken').replace(/"/g, ''),
          };
          this.userService.refreshToken(payload).subscribe((res) => {
            localStorage.setItem('accessToken', JSON.stringify(res.accessToken));
            localStorage.setItem('refreshToken', JSON.stringify(res.refreshToken));
            this.onSubmit();
          });
        } else {
          this.toastr.error(error?.details?.message);
        }
      },
    });
  }
}
