import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-contract-info-card',
  templateUrl: './contract-info-card.component.html',
  styleUrls: ['./contract-info-card.component.scss'],
})
export class ContractInfoCardComponent implements OnInit {
  @Input() contractDetail: any;
  constructor() {}

  ngOnInit(): void {}
}
