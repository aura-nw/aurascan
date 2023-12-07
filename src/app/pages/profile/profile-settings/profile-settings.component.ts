import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { LOCAL_DATA } from 'src/app/core/constants/common.constant';
import { UserStorage } from 'src/app/core/models/common.model';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { UserService } from 'src/app/core/services/user.service';
import local from 'src/app/core/utils/storage/local';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss'],
})
export class ProfileSettingsComponent implements OnInit {
  userEmail = local.getItem<UserStorage>(LOCAL_DATA.USER_DATA)?.email;
  changePassForm;
  hideOldPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  isSubmit = false;
  errorMessage = '';
  currentProvider = 'password';
  isError = false;
  textTitle = 'Change password';

  constructor(private fb: UntypedFormBuilder, private userService: UserService, private toastr: NgxToastrService) {}

  ngOnInit(): void {
    this.currentProvider = local.getItem(LOCAL_DATA.LOGIN_PROVIDER);
    this.formInit();

    if (this.currentProvider === 'google') {
      this.textTitle = 'Create password';
    }
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
      this.changePassForm.controls['old_password']?.addValidators([Validators.required]);
    }
  }

  onSubmit() {
    this.errorMessage = '';
    let payload = {
      oldPassword: this.changePassForm.value?.old_password,
      password: this.changePassForm.value?.new_password,
      passwordConfirmation: this.changePassForm.value?.cf_new_password,
    };
    this.userService.changePassword(payload).subscribe({
      next: (res) => {
        const passwordText = this.currentProvider === 'google' ? 'Password created' : 'Password changed';
        this.toastr.successWithTitle('Please use the new password next time you log in.', passwordText);

        if (this.currentProvider === 'google') {
          local.setItem(LOCAL_DATA.LOGIN_PROVIDER, 'password');
          setTimeout(() => {
            window.location.reload();
          }, 4000);
        }
      },
      error: (error) => {
        this.isError = true;
        this.errorMessage = error?.error?.error?.details?.message;
      },
    });
  }

  checkDisableForm() {
    let result = false;
    if (
      this.changePassForm.status === 'INVALID' ||
      this.changePassForm.value.new_password === this.changePassForm.value.old_password ||
      (this.changePassForm.value.new_password !== this.changePassForm.value.cf_new_password &&
        this.changePassForm.value.new_password.length > 0 &&
        this.changePassForm.value.cf_new_password?.length > 0) ||
      this.isError
    ) {
      result = true;
    }
    return result;
  }
}
