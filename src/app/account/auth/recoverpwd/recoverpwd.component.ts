import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-recoverpwd',
  templateUrl: './recoverpwd.component.html',
  styleUrls: ['./recoverpwd.component.scss']
})

/**
 * Recover Password Component
 */
export class RecoverpwdComponent implements OnInit {

  resetForm!: FormGroup;
  submitted = false;
  error = '';
  success = '';
  loading = false;

  // set the currenr year
  year: number = new Date().getFullYear();
  // Carousel navigation arrow show
  showNavigationArrows: any;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    /**
     * Form Validation
     */
    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.resetForm.controls; }

  /**
   * On submit form
   */
  onSubmit() {
    this.success = '';
    this.submitted = true;
    // stop here if form is invalid
    if (this.resetForm.invalid) {
      return;
    }
  }

}
