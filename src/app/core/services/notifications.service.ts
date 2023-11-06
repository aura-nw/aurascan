import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { BehaviorSubject, Subject, exhaustMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EnvironmentService } from '../data-services/environment.service';
import { ResponseTemplate } from '../models/common.model';
import { initializeApp } from 'firebase/app';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  apiUrl = '';
  vapidKey = '';
  userId = '';

  notificationsSubject$ = new Subject<any>();
  notificationStore$ = new BehaviorSubject<any[]>([]);

  get notifications() {
    return this.notificationStore$.getValue();
  }

  private _currentFcmToken: string;
  set currentFcmToken(e: string) {
    this._currentFcmToken = e;
  }
  get currentFcmToken() {
    return this._currentFcmToken;
  }

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    this.apiUrl = `${this.environmentService.backend}`;
  }

  init() {
    // if (!this.environmentService.isMobile) {
    this.requestPermission();
    this.listen();

    this.notificationsSubject$.asObservable().subscribe((payload) => {
      if (!payload) return;

      // let notification = payload.notification;

      // if ('serviceWorker' in navigator) {
      //   navigator.serviceWorker.getRegistrations().then((registration) => {
      //     registration[0].showNotification(notification.title, {
      //       ...payload,
      //       image: notification.image,
      //       body: notification.body,
      //     });
      //   });
      // }
    });
    // }
  }

  private async requestPermission(): Promise<void> {
    let messaging;
    try {
      messaging = getMessaging();
    } catch (err) {}

    await getToken(messaging, {
      vapidKey: environment.firebaseConfig.vapidKey, // 'BC42DYfTLtjkG08kw3fBs3Phqb71WnSgDKQf7vQpCJjCq6ZVrdNvez8uzAvbEyWGV8bpNOGy6bw0wszo-Pkk-OI',
    })
      .then((currentToken) => {
        if (currentToken) {
          this.currentFcmToken = currentToken;
        } else {
          console.log('No registration token available. Request permission to generate one.');
        }
      })
      .catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
      });
  }

  private listen() {
    const messaging = getMessaging();
    onMessage(messaging, this.notificationsSubject$);
  }

  async registerFcmToken() {
    // if (this.environmentService.isMobile) {
    //   return;
    // }

    if (!this.currentFcmToken) {
      await this.requestPermission();
    }

    this.http
      .post(`${this.apiUrl}/notifications/register`, {
        fcm_token: this.currentFcmToken,
      })
      .subscribe((res: any) => {
        console.log('res', res);
        if (res) {
          this.userId = res.data.user_id;
        }
      });
  }
}
