import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
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
  errorCode = '';
  mode = this.screenType.Login;
  checkEmail = false;
  checkPassword = false;
  hidePassword = true;
  hideConfirmPassword = true;
  emailFormat = '';
  isForgotScreen = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: ActivatedRoute,
    private route: Router,
  ) {}

  ngOnInit(): void {
    // check exit email
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      this.route.navigate(['/']);
    }

    // check link from verify mail
    if (this.router.snapshot.url[0]?.path === 'welcome' || this.router.snapshot.url[0]?.path === 'already-active') {
      this.mode = this.screenType.Welcome;
      return;
    }

    if (this.router.snapshot.params.mode == '0') {
      this.mode = this.screenType.Login;
      this.route.navigate(['login']);
    }

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
    this.errorMessage = '';
    this.isForgotScreen = false;
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

    let payload = {
      email: this.loginForm.value?.email,
      password: this.loginForm.value?.password,
    };

    const tempChar = this.loginForm.value?.email?.indexOf('@');
    let strStart = this.loginForm.value?.email?.substring(0, 3) + '***';
    if (tempChar <= 3) {
      strStart = this.loginForm.value?.email?.substring(0, tempChar);
    }
    this.emailFormat = strStart + this.loginForm.value?.email?.substring(tempChar);

    switch (this.mode) {
      case this.screenType.Login:
        this.userService.loginWithPassword(payload).subscribe({
          next: (res) => {
            if (!res.error) {
              localStorage.setItem('accessToken', JSON.stringify(res.accessToken));
              localStorage.setItem('refreshToken', JSON.stringify(res.refreshToken));
              localStorage.setItem('userEmail', JSON.stringify(res.email));
              this.route.navigate(['/']);
            }
          },
          error: (error) => {
            this.errorMessage = error?.details?.message;
            this.errorCode = error?.details?.code;
          },
        });
        break;
      case this.screenType.Register:
        payload['passwordConfirmation'] = this.loginForm.value?.confirmPassword;
        this.userService.registerUser(payload).subscribe({
          next: (res) => {
            this.mode = this.screenType?.Verify;
            this.isForgotScreen = false;
          },
          error: (error) => {
            this.errorMessage = error?.details?.message[0];
          },
        });
        break;
      default:
        break;
    }
  }

  resetPassword() {
    const tempChar = this.loginForm.value?.email?.indexOf('@');
    let strStart = this.loginForm.value?.email?.substring(0, 3) + '***';
    if (tempChar <= 3) {
      strStart = this.loginForm.value?.email?.substring(0, tempChar);
    }
    this.emailFormat = strStart + this.loginForm.value?.email?.substring(tempChar);

    this.userService.sendResetPasswordEmail(this.loginForm.value?.email).subscribe({
      next: (res) => {
        this.isForgotScreen = true;
        this.mode = this.screenType.Verify;
      },
      error: (error) => {
        this.errorMessage = error.details.message;
      },
    });
  }

  resendMail() {
    if (this.isForgotScreen) {
      this.userService.sendResetPasswordEmail(this.loginForm.value?.email).subscribe({
        next: (res) => {},
        error: (error) => {
          this.errorMessage = error.details.message;
        },
      });
    } else {
      this.userService.resendVerifyEmail(this.loginForm.value?.email).subscribe({
        next: (res) => {},
        error: (error) => {
          this.errorMessage = error.details.message;
        },
      });
    }
  }
}
