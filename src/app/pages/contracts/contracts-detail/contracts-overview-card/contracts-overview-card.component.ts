import { Component, OnInit } from '@angular/core';
import { Globals } from '../../../../global/global';

@Component({
  selector: 'app-contracts-overview-card',
  templateUrl: './contracts-overview-card.component.html',
  styleUrls: ['./contracts-overview-card.component.scss']
})
export class ContractsOverviewCardComponent implements OnInit {

  constructor(public global: Globals) { }

  ngOnInit(): void {
  }

}
