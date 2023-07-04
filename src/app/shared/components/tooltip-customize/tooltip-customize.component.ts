import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-tooltip-customize',
  templateUrl: './tooltip-customize.component.html',
  styleUrls: ['./tooltip-customize.component.scss']
})
export class TooltipCustomizeComponent implements OnInit {
  @Input() content: string;
  constructor() { }

  ngOnInit(): void {
  }

}
