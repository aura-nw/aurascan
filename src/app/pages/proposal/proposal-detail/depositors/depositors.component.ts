import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-depositors',
  templateUrl: './depositors.component.html',
  styleUrls: ['./depositors.component.scss']
})
export class DepositorsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  changeTab(tabId): void {
    console.log(tabId);
    
  }
}
