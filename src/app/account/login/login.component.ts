import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../../core/services/auth.service';
import { LAYOUT_MODE } from '../../layouts/layouts.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

/**
 * Login Component
 */
export class LoginComponent implements OnInit {

  // set the currenr year
  year: number = new Date().getFullYear();
  // Carousel navigation arrow show
  showNavigationArrows: any;
  loginForm!: FormGroup;
  submitted = false;
  error = '';
  returnUrl!: string;
  layout_mode!: string;
  fieldTextType!: boolean;

  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authFackservice: AuthenticationService,
  ) {

  }

  ngOnInit(): void {

    this.layout_mode = LAYOUT_MODE
    if (this.layout_mode === 'dark') {
      document.body.setAttribute("data-layout-mode", "dark");
    }
    //Validation Set
    this.loginForm = this.formBuilder.group({
      username: ['admin', [Validators.required]],
      password: ['admin', [Validators.required]],
    });
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    } else {

      this.authFackservice.login(this.loginForm.value)
        .pipe(first())
        .subscribe(
          data => {
            this.router.navigate(['/']);
          },
          error => {
            this.error = error ? error : '';
          });

    }
  }

  /**
   * Password Hide/Show
   */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

}
