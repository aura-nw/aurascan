import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogConfig } from '@angular/material/dialog';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm;
  screenType = {
    Login: 'login',
    Register: 'register',
    Verify: 'verify',
    Welcome: 'welcome',
    Forgot: 'forgot',
  };
  isSubmit = false;
  errorMessage = '';
  mode = this.screenType.Login;
  checkEmail = false;
  checkPassword = false;
  hidePassword = true;
  hideConfirmPassword = true;
  emailFormat = '';

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    this.formInit();
  }

  get getEmail() {
    return this.loginForm.get('email');
  }

  get getPassword() {
    return this.loginForm.get('password');
  }

  get getConfirmPassword() {
    return this.loginForm.get('confirmPassword');
  }

  formInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      password: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$'),
        ],
      ],
      confirmPassword: [''],
    });
  }

  onSubmit() {
    this.isSubmit = true;
  }

  changeMode(mode) {
    this.mode = mode;
  }

  checkVerifyPassword() {
    if (this.mode === this.screenType.Register) {
      this.checkPassword = true;
    }
  }

  showVerifyMail() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'grant-overlay-panel';
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      email: this.loginForm.value?.email,
      mode: this.mode,
    };
    this.errorMessage = '';

    switch (this.mode) {
      case this.screenType.Login:
        let payloadLogin = {
          email: this.loginForm.value?.email,
          password: this.loginForm.value?.password,
        };
        this.userService.loginWithPassword(payloadLogin).subscribe({
          next: (res) => {
          },
          error: (error) => {
            this.errorMessage = error.details.message;
          },
        });
        break;
      case this.screenType.Register:
        let payloadRegister = {
          email: this.loginForm.value?.email,
          password: this.loginForm.value?.password,
          passwordConfirmation: this.loginForm.value?.confirmPassword,
        };
        this.userService.registerUser(payloadRegister).subscribe({
          next: (res) => {
            this.mode = this.screenType.Verify;
            const tempChar = this.loginForm.value?.email.indexOf('@');
            let strStart = this.loginForm.value?.email.substring(0, 3) + '***';
            if (tempChar <= 3) {
              strStart = this.loginForm.value?.email.substring(0, tempChar);
            }
            this.emailFormat = strStart + this.loginForm.value?.email.substring(tempChar);
          },
          error: (error) => {
            this.errorMessage = error.details.message[0];
          },
        });
        break;
      case this.screenType.Forgot:
        break;
      case this.screenType.Welcome:
        break;
      case this.screenType.Verify:
        break;
      default:
        break;
    }
  }
}
