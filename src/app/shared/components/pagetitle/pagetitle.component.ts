import { Component, Input } from '@angular/core';
import { Globals } from '../../../global/global';

@Component({
  selector: 'app-pagetitle',
  templateUrl: './pagetitle.component.html',
  styleUrls: ['./pagetitle.component.scss'],
})

/**
 * Page Title Component
 */
export class PagetitleComponent {
  @Input() title: string | undefined;
  @Input() displayInfo: boolean = false;
  @Input() mobileDisplay: boolean = false;

  constructor(public global: Globals) {}
}
