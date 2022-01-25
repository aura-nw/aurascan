import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '../app/core/services/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = '';
  constructor(
    private authService: AuthenticationService,
  ) {
  }
  ngOnInit(): void {

  }
}
