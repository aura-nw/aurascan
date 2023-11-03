import { Component } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { NotificationsService } from 'src/app/core/services/notifications.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent {
  isTabAll = true;
  constructor(private notificationsService: NotificationsService) {}

  ngOnInit(): void {
    this.notificationsService.init();
  }

  linkLogin() {}
}
