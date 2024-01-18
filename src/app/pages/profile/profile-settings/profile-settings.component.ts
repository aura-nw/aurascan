import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { STORAGE_KEYS } from 'src/app/core/constants/common.constant';
import { ELoginProvider, IUser } from 'src/app/core/models/auth.models';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { UserService } from 'src/app/core/services/user.service';
import local from 'src/app/core/utils/storage/local';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss'],
})
export class ProfileSettingsComponent implements OnInit, OnDestroy {
  changePassForm: UntypedFormGroup;
  hideOldPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  isSubmit = false;
  errorMessage = '';
  isError = false;
  textTitle = 'Change password';
  user: IUser;

  destroy$ = new Subject<void>();

  constructor(
    private fb: UntypedFormBuilder,
    private userService: UserService,
    private toastr: NgxToastrService,
    private router: Router,
  ) {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.userService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (!user) {
        this.router.navigate(['/']);
      }
      this.user = user;

      if (user.provider === ELoginProvider.Google) {
        this.textTitle = 'Create password';
      }

      this.formInit();
    });
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
    if (this.user.provider != ELoginProvider.Google) {
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

    this.userService
      .changePassword(payload)
      .pipe(
        switchMap(() => {
          const isGoogleProvider = this.user.provider === ELoginProvider.Google;

          const passwordText = isGoogleProvider ? 'Password created' : 'Password changed';
          this.toastr.successWithTitle('Please use the new password next time you log in.', passwordText);

          if (isGoogleProvider) {
            local.setItem(STORAGE_KEYS.LOGIN_PROVIDER, ELoginProvider.Password);
          }

          this.changePassForm.reset();

          return this.userService.loginWithPassword({
            email: this.user.email,
            password: payload.password,
          });
        }),
      )
      .subscribe({
        next: (res) => {
          if (!res.error) {
            this.userService.setUser({ ...res, email: res.userEmail || res.email });
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
