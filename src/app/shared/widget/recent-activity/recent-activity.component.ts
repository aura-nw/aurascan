import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-recent-activity',
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.scss']
})

/**
 * Recent Activity Component
 */
export class RecentActivityComponent implements OnInit {

  @Input() recentActivity: Array<{
    icon?: string;
    date?: number;
    content?: string;
    coine?: string;
    price?: string;
  }> | undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
