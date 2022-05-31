import { Component, OnInit } from '@angular/core';
import { Globals } from '../../../../global/global';

@Component({
  selector: 'app-contracts-overview',
  templateUrl: './contracts-overview.component.html',
  styleUrls: ['./contracts-overview.component.scss']
})
export class ContractsOverviewComponent implements OnInit {

  constructor(public global: Globals) { }

  ngOnInit(): void {
  }

}
