import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-popup-verify-mail',
  templateUrl: './popup-verify-mail.component.html',
  styleUrls: ['./popup-verify-mail.component.scss'],
})
export class PopupVerifyMailComponent implements OnInit {
  emailFormat = '';
  typeLogin = {
    Login: 'login',
    Register: 'register',
    Welcome: 'welcome',
    Forgot: 'forgot',
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { email: string; mode: string },
    public dialogRef: MatDialogRef<PopupVerifyMailComponent>,
  ) {}

  ngOnInit(): void {
    const tempChar = this.data.email.indexOf('@');
    let strStart = this.data.email.substring(0, 3) + '***';
    if (tempChar <= 3) {
      strStart = this.data.email.substring(0, tempChar);
    }
    this.emailFormat = strStart + this.data.email.substring(tempChar);
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
