import { Component, Input, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-a-paginator',
  templateUrl: './a-paginator.component.html',
  styleUrls: ['./a-paginator.component.scss'],
})
export class APaginatorComponent {
  @Input() paginator: MatPaginator;
  @Input() length: number;

  constructor() {}

  pageChange(e) {
    console.log(e);
  }
}
