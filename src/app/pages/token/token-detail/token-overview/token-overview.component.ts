import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-token-overview',
  templateUrl: './token-overview.component.html',
  styleUrls: ['./token-overview.component.scss']
})
export class TokenOverviewComponent implements OnInit {
  @Input() isNFTContract: boolean;
  constructor() { }

  ngOnInit(): void {
  }

}
