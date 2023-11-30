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
  @Input()
  breadcrumbItems!: Array<{
    active?: boolean;
    label?: string;
  }>;

  @Input() title: string | undefined;
  @Input() displayInfo: boolean = false;

  constructor(public global: Globals) {}
}
