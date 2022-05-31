import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface DropdownElement {
  image?: string;
  key: string | number;
  label: string;
  disableTranslate?: boolean;
}

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent implements OnInit {
  @Input() elements: DropdownElement[];
  @Output() onSelected: EventEmitter<DropdownElement> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
  elementClick(el: DropdownElement): void {
    this.onSelected.emit(el);
  }
}
