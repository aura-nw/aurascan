import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-a-paginator',
  templateUrl: './a-paginator.component.html',
  styleUrls: ['./a-paginator.component.scss'],
})
export class APaginatorComponent {
  @Input() paginator: PageEvent;
  @Input() length: number;
  @Input() maxSize = 5;

  @Output() pageChange = new EventEmitter();

  constructor() {}
}
