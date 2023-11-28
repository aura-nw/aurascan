import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';

@Component({
  selector: 'app-custom-paginator',
  templateUrl: './custom-paginator.component.html',
  styleUrls: ['./custom-paginator.component.scss'],
})
export class CustomPaginatorComponent {
  @Input() paginator: PageEvent;
  @Input() length: number;
  @Input() maxSize = 5;

  @Output() pageChange = new EventEmitter();

  constructor() {}
}
