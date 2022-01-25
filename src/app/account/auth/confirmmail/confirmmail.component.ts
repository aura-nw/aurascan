import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-confirmmail',
  templateUrl: './confirmmail.component.html',
  styleUrls: ['./confirmmail.component.scss']
})

/**
 * Confirm-Mail Component
 */
export class ConfirmmailComponent implements OnInit {

  // set the currenr year
  year: number = new Date().getFullYear();
  // Carousel navigation arrow show
  showNavigationArrows: any;

  constructor() { }

  ngOnInit(): void {
  }

}
