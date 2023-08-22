import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-table-no-data',
  templateUrl: './table-no-data.component.html',
  styleUrls: ['./table-no-data.component.scss']
})

export class TableNoDataComponent implements OnInit {
  @Input() textNull: string = 'NO DATA';
  @Input() img: string = 'assets/images/icons/noValues.svg';
  constructor() { }

  ngOnInit(): void {}
}
