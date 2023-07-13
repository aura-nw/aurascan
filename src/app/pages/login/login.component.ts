import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PopupVerifyMailComponent } from './popup-verify-mail/popup-verify-mail.component';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm;
  typeLogin = {
    Login: 'login',
    Register: 'register',
    Welcome: 'welcome',
    Forgot: 'forgot',
  };
  isSubmit = false;

  mode = this.typeLogin.Login;
  checkEmail = false;
  checkPassword = false;

  constructor(private dialog: MatDialog, private fb: FormBuilder) {}

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
    if (this.mode === this.typeLogin.Register) {
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
    let dialogRef = this.dialog.open(PopupVerifyMailComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      // if (result) {
      // }
    });
  }
}
