import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import * as _ from 'lodash';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';
import { STORAGE_KEYS } from '../constants/common.constant';
import { EnvironmentService } from '../data-services/environment.service';
import local from '../utils/storage/local';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  apiUrl = '';
  vapidKey = '';
  userId = '';
  lstNoti = [];
  isMobileMatched = false;
  countUnread = 0;

  notificationsSubject$ = new Subject<any>();
  notificationStore$ = new BehaviorSubject<any[]>([]);
  hiddenFooterSubject = new BehaviorSubject<boolean>(false);
  destroyed$ = new Subject<void>();
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(takeUntil(this.destroyed$));

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

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
    private userService: UserService,
  ) {
    this.environmentService.config.asObservable().subscribe((res) => {
      this.apiUrl = res.api.backend;
    });
    this.breakpoint$.subscribe((state) => {
      if (state) {
        this.environmentService.isMobile = state.matches;
        this.isMobileMatched = state.matches;
      }
    });
  }

  init() {
    if (this.isMobileMatched) {
      return;
    }

    this.requestPermission();
    this.listen();

    this.notificationsSubject$.asObservable().subscribe((payload) => {
      if (!payload) return;
      let notification = payload.notification;

      // check exit email
      const userEmail = this.userService.getCurrentUser()?.email; // local.getItem<IUser>(STORAGE_KEYS.USER_DATA)?.email;
      console.log(userEmail);

      if ('serviceWorker' in navigator && userEmail) {
        navigator.serviceWorker.getRegistrations().then((registration) => {
          registration[0].showNotification(notification.title, {
            ...payload,
            image: notification.image,
            body: notification.body,
          });
        });

        this.notificationStore$.next(['reload']);
      }
    });
  }

  private async requestPermission(): Promise<void> {
    let messaging;
    try {
      messaging = getMessaging();
    } catch (err) {}

    await getToken(messaging, {
      vapidKey: environment.firebaseConfig.vapidKey,
    })
      .then((currentToken) => {
        if (currentToken) {
          this.currentFcmToken = currentToken || null;
        }
      })
      .catch((err) => {});
  }

  private listen() {
    const messaging = getMessaging();
    onMessage(messaging, this.notificationsSubject$);
  }

  async registerFcmToken() {
    if (this.isMobileMatched) {
      return;
    }

    if (!this.currentFcmToken) {
      await this.requestPermission();
    }

    this.http
      .post(`${this.apiUrl}/users/register-notification-token`, {
        token: this.currentFcmToken,
      })
      .subscribe((res: any) => {
        if (res) {
          local.removeItem(STORAGE_KEYS.REGISTER_FCM);
          this.userId = res.data.user_id;
        }
      });
  }

  getListNoti(payload) {
    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();
    return this.http.get<any>(`${this.apiUrl}/notification`, {
      params,
    });
  }

  readNoti(id = null) {
    if (id) {
      const payload = { id: id };
      const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();
      return this.http.put<any>(`${this.apiUrl}/notification/read/${payload.id}`, params);
    } else {
      return this.http.put<any>(`${this.apiUrl}/notification/read-all`, null);
    }
  }

  getQuotaNoti() {
    return this.http.get<any>(`${this.apiUrl}/quota-notifications`);
  }

  deleteToken() {
    return this.http.delete<any>(`${this.apiUrl}/users/delete-notification-token/${this.currentFcmToken}`).subscribe({
      complete: () => {
        this.currentFcmToken = null;
      },
      error: () => {
        this.currentFcmToken = null;
      },
    });
  }
}
