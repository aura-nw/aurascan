import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  formValid = false;
  email = '';
  passWord = '';

  constructor() {

  }

  ngOnInit(): void {}

  closeDialog() {}

  onSubmit() {}

  checkFormValid() {}

  signOut(): void {
  }
}
