import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent implements OnInit {
  @Input() elements: DropdownElement[];
  @Input() currentLabel: string | number = '';
  @Output() onSelected: EventEmitter<DropdownElement> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  elementClick(el: DropdownElement): void {
    if (el.key == this.currentLabel) {
      this.onSelected.emit(null);
      return;
    }

    this.onSelected.emit(el);
  }
}
