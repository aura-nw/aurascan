import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { STORAGE_KEYS } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ELoginProvider } from 'src/app/core/models/auth.models';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { UserService } from 'src/app/core/services/user.service';
import local from 'src/app/core/utils/storage/local';

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
  errorMessage = [];
  errorCode = '';
  mode = this.screenType.Login;
  checkEmail = false;
  checkPassword = false;
  hidePassword = true;
  hideConfirmPassword = true;
  emailFormat = '';
  isForgotScreen = false;
  isError = false;
  errorResendMsg = 'Only can do resend email after 5 minute, please wait and click Resend again.';

  clientId = this.environmentService.googleClientId;

  constructor(
    private fb: UntypedFormBuilder,
    private userService: UserService,
    private router: ActivatedRoute,
    private route: Router,
    public environmentService: EnvironmentService,
    private toastr: NgxToastrService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // check exit email
    const userEmail = this.userService.getCurrentUser()?.email;
    if (userEmail) {
      this.route.navigate(['/']);
    }

    // check link from verify mail
    if (this.router.snapshot.url[0]?.path === 'welcome' || this.router.snapshot.url[0]?.path === 'already-active') {
      this.mode = this.screenType.Welcome;
      return;
    }

    this.formInit();
    this.initGoogleLogin();
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

  changeEmail() {
    this.checkEmail = true;
    this.isError = false;
    this.getEmail.setValue(this.getEmail.value.trim());
  }

  changePass() {
    this.checkPassword = true;
    this.isError = false;
    this.getPassword.setValue(this.getPassword.value.trim());
  }

  formInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,10}$')]],
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
    this.errorMessage = [];
    this.isForgotScreen = false;
    this.isError = false;

    // load google api script
    this.loadScript('GoogleLoginProvider', 'https://accounts.google.com/gsi/client', () => {
      // Callback
    });
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
    this.errorMessage = [];

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
              local.setItem(STORAGE_KEYS.REGISTER_FCM, 'true');

              this.userService.setUser({
                ...res,
                email: res.userEmail || res.email,
                provider: ELoginProvider.Password,
              });
              this.route.navigate(['/profile']);
            }
          },
          error: (err) => {
            const error = err?.error?.error?.details;
            this.addError(error?.message || err.statusText);
            this.errorCode = error?.code;
            this.isError = true;

            this.userService.setUser(null);
          },
        });
        break;
      case this.screenType.Register:
        payload['passwordConfirmation'] = this.loginForm.value?.confirmPassword;
        this.userService.registerUser(payload).subscribe({
          next: (res) => {
            this.errorMessage = [];
            this.mode = this.screenType?.Verify;
            this.isForgotScreen = false;
          },
          error: (err) => {
            const error = err?.error?.error?.details;
            this.errorCode = error?.code;
            this.addError(error?.message[0] || err.statusText);
            this.isError = true;
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
        this.errorMessage = [];
        this.mode = this.screenType.Verify;
      },
      error: (err) => {
        const error = err?.error?.error?.details;
        this.errorMessage = [];
        this.errorCode = error?.code;
        if (error?.message.indexOf('registered') >= 0 || error?.message.indexOf('verified') >= 0) {
          this.addError(error?.message);
        } else {
          this.toastr.error(error?.message);
        }
        this.isError = true;
      },
    });
  }

  resendMail() {
    if (this.isForgotScreen) {
      this.userService.sendResetPasswordEmail(this.loginForm.value?.email).subscribe({
        next: (res) => {},
        error: (err) => {
          this.toastr.error(err?.error?.error?.details?.message);
        },
      });
    } else {
      this.userService.resendVerifyEmail(this.loginForm.value?.email).subscribe({
        next: (res) => {},
        error: (err) => {
          this.toastr.error(err?.error?.error?.details?.message);
        },
      });
    }
  }

  addError(error) {
    this.cdr.markForCheck();
    if (this.errorMessage?.length === 0 && error !== this.errorResendMsg) {
      this.errorMessage?.push(error);
    }
    this.cdr.detectChanges();
  }

  initGoogleLogin() {
    // inject callback function
    window.handleCredentialResponse = (response) => {
      if (response.credential) {
        const payload = {
          token: response.credential,
          site: 'main',
        };

        this.userService.loginWithGoogle(payload).subscribe({
          next: (res) => {
            local.setItem(STORAGE_KEYS.REGISTER_FCM, 'true');

            this.userService.setUser({
              ...res,
              email: res.userEmail || res.email,
              provider: res.provider || ELoginProvider.Password,
            });

            this.route.navigate(['/profile']);
          },
          error: (err) => {
            this.addError(err?.error?.error?.details?.message);
          },
        });
      }
    };
    // load google api script
    this.loadScript('GoogleLoginProvider', 'https://accounts.google.com/gsi/client', () => {
      // Callback
    });
  }

  loadScript(id: string, src: string, onload: any): void {
    // get document if platform is only browser
    if (typeof document !== 'undefined' && !document.getElementById(id)) {
      let signInJS = document.createElement('script');
      signInJS.async = true;
      signInJS.src = src;
      signInJS.onload = onload;
      const parentElement = document.head;
      parentElement.appendChild(signInJS);
    }
  }
}
