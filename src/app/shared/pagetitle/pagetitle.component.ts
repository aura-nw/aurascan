import { Component, OnInit, Input } from '@angular/core';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-pagetitle',
  templateUrl: './pagetitle.component.html',
  styleUrls: ['./pagetitle.component.scss']
})

/**
 * Page Title Component
 */
export class PagetitleComponent implements OnInit {

  @Input()
  breadcrumbItems!: Array<{
    active?: boolean;
    label?: string;
  }>;

  @Input() title: string | undefined;
  @Input() displayInfo: boolean;

  constructor(public global: Globals) { }

  ngOnInit(): void {
  }
}
