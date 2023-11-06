import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-qr',
  templateUrl: './qr.component.html',
  styleUrls: ['./qr.component.scss'],
})
export class QrComponent implements OnInit, OnChanges {
  @Input() address: string = '';

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(): void {}
}
