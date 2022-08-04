import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-token-summary',
  templateUrl: './token-summary.component.html',
  styleUrls: ['./token-summary.component.scss'],
})
export class TokenSummaryComponent implements OnInit {
  @Input() isNFTContract: boolean;
  @Input() tokenDetail: any;
  constructor() {}

  ngOnInit(): void {
  }
}
