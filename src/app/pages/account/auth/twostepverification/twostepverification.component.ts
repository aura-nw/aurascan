import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-twostepverification',
  templateUrl: './twostepverification.component.html',
  styleUrls: ['./twostepverification.component.scss']
})

/**
 * Two Step Verification Component
 */
export class TwostepverificationComponent implements OnInit {

  // set the currenr year
  year: number = new Date().getFullYear();
  // Carousel navigation arrow show
  showNavigationArrows: any;

  /**
   * Confirm Otp Verification
   */
  config = {
    allowNumbersOnly: true,
    length: 4,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: '',
    inputStyles: {
      'width': '80px',
      'height': '50px'
    }
  };

  constructor() { }

  ngOnInit(): void {
  }

}
