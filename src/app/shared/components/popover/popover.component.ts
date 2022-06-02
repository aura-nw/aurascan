import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss']
})
export class PopoverComponent implements OnInit {
  @Input() tokenDetail: any;
  @Input() tokenAddress: any;
  @Input() tokenType: any;
  @Input() global: any;
  @Input() codeTransaction: any;
  constructor() { }

  ngOnInit(): void {
  }

}
