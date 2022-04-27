import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { environment } from '../../../../environments/environment';
import { AuthenticationService } from '../../../core/services/auth.service';
import { UserProfileService } from '../../../core/services/user.service';
import { LAYOUT_MODE } from '../../../layouts/layouts.model';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

/**
 * Register Component
 */
export class RegisterComponent implements OnInit {

  // set the currenr year
  year: number = new Date().getFullYear();

  // Carousel navigation arrow show
  showNavigationArrows: any;

  layout_mode!: string;

  signupForm!: FormGroup;
  submitted = false;
  successmsg = false;
  error = '';

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private userService: UserProfileService) { }

  ngOnInit(): void {
    this.layout_mode = LAYOUT_MODE
    if (this.layout_mode === 'dark') {
      document.body.setAttribute("data-layout-mode", "dark");
    }

    // Validation Set
    this.signupForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.signupForm.controls; }

  /**
   * On submit form
   */
  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.signupForm.invalid) {
      return;
    } else {
      // if (environment.defaultauth === 'firebase') {
      //   this.authenticationService.register(this.f.email.value, this.f.password.value).then((res: any) => {
      //     this.successmsg = true;
      //     if (this.successmsg) {
      //       this.router.navigate(['']);
      //     }
      //   })
      //     .catch((error: string) => {
      //       this.error = error ? error : '';
      //     });
      // } else {
      //   this.userService.register(this.signupForm.value)
      //     .pipe(first())
      //     .subscribe(
      //       (data: any) => {
      //         this.successmsg = true;
      //         if (this.successmsg) {
      //           this.router.navigate(['/account/login']);
      //         }
      //       },
      //       (error: any) => {
      //         this.error = error ? error : '';
      //       });
      // }
    }
  }

}
