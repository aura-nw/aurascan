import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-a-paginator',
  templateUrl: './a-paginator.component.html',
  styleUrls: ['./a-paginator.component.scss'],
})
export class APaginatorComponent {
  @Input() paginator: PageEvent;
  @Input() length: number;

  @Output() pageChange = new EventEmitter();

  constructor() {}
}
