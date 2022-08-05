import { Component, Input, OnInit } from '@angular/core';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-token-overview',
  templateUrl: './token-overview.component.html',
  styleUrls: ['./token-overview.component.scss']
})
export class TokenOverviewComponent implements OnInit {
  @Input() tokenDetail: any;
  constructor(public global: Globals) { }

  ngOnInit(): void {
  }
}
