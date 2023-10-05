import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  emailFormat = '';
  userEmail = '';
  resetForm;
  data;
  mode = 'default';
  hidePassword = true;
  hideConfirmPassword = true;
  codeVerify = '';
  errorMessage = '';

  constructor(private fb: UntypedFormBuilder, private router: ActivatedRoute, private userService: UserService) {}

  ngOnInit(): void {
    this.codeVerify = this.router.snapshot?.params?.code;
    this.userEmail = this.router.snapshot?.params?.email;
    if (this.userEmail) {
      const tempChar = this.userEmail.indexOf('@');
      let strStart = this.userEmail.substring(0, 3) + '***';
      if (tempChar <= 3) {
        strStart = this.userEmail.substring(0, tempChar);
      }
      this.emailFormat = strStart + this.userEmail.substring(tempChar);
    }
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

  onSubmit() {
    const payload = {
      email: this.userEmail,
      resetPasswordToken: this.codeVerify,
      password: this.resetForm.value?.password,
      passwordConfirmation: this.resetForm.value?.confirmPassword,
    };
    this.userService.resetPasswordWithCode(payload).subscribe({
      next: (res) => {
        this.mode = 'resetSuccess';
      },
      error: (error) => {
        this.errorMessage = error?.details?.message;
      },
    });
  }
}
