import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-token-summary',
  templateUrl: './token-summary.component.html',
  styleUrls: ['./token-summary.component.scss'],
})
export class TokenSummaryComponent {
  @Input() tokenDetail: any;

  constructor() {}
}
