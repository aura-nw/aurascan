import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent {
  isTabAll = true;
  lstData = [];
  typeNoti = {
    Executed: 'Executed',
    TokenSent: 'Token Sent',
    TokenReceived: 'Token Received',
    NFTSent: 'NFT Sent',
    NFTReceived: 'NFT Received',
    CoinSent: 'Coin Sent',
    CoinReceived: 'Coin Received',
  };
  isFirstLoad = true;
  isInit = true;
  isLoading = true;
  loadNewNoti = false;

  constructor(
    private notificationsService: NotificationsService,
    private router: Router,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    // check exit email
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      return;
    }

    // if (this.isInit) {
    //   this.notificationsService.init();
    //   this.isInit = false;
    // }

    this.notificationsService.notificationStore$.subscribe((res) => {
      if (res?.length > 0 && !this.loadNewNoti) {
        this.loadNewNoti = true;
        if (this.lstData?.length >= 100) {
          this.getQuotaNoti();
        } else {
          this.getListNoti();
        }

        setTimeout(() => {
          this.loadNewNoti = false;
        }, 10000);
      }
    });
  }

  showData() {
    if (this.isFirstLoad) {
      this.getListNoti();
      this.isFirstLoad = false;

      setTimeout(() => {
        this.getQuotaNoti(true);
      }, 1000);
    }
  }

  getListNoti() {
    const payload = {
      unread: false,
    };
    this.notificationsService.getListNoti(payload).subscribe(
      (res) => {
        this.notificationsService.lstNoti = this.lstData = res.data;
        this.lstData.forEach((element) => {
          this.handleDisplayNoti(element);
        });
      },
      () => {},
      () => {
        this.isLoading = false;
      },
    );
  }

  getQuotaNoti(isInit = false) {
    this.notificationsService.getQuotaNoti().subscribe((res) => {
      if (res >= 100) {
        const dataWarning = {
          display:
            'You have reached out your daily quota limit of 100 notifications per day. Kindly go to your watchlist to turn on the' +
            ' notification mode and adjust your current configuration for your watchlist’s addresses and group of tracking activities to avoid over quota again”',
        };
        this.lstData.unshift(dataWarning);
      } else if (!isInit) {
        this.getListNoti();
      }
    });
  }

  handleDisplayNoti(element) {
    try {
      const data = element.body.data;
      switch (element.title) {
        case this.typeNoti.Executed:
          element.display = `New <span class="highlight-noti">${
            data.type
          }</span> transaction initiated by <span class="highlight-noti">${this.cutString(data.sender)}</span>`;
          break;
        case this.typeNoti.TokenSent:
        case this.typeNoti.TokenReceived:
          element.display = `<span class="highlight-noti">${
            data.tokens + (data.num >= 3 ? ' and more' : '')
          }</span> ${
            element.title === this.typeNoti.TokenSent ? 'sent' : 'received'
          } by <span class="highlight-noti">${this.cutString(data.from || data.to)}</span>`;
          break;
        case this.typeNoti.NFTSent:
        case this.typeNoti.NFTReceived:
          element.display = `NFT id <span class="highlight-noti">${
            data.tokens + (data.num >= 2 ? ' and more' : '')
          }</span> ${
            element.title === this.typeNoti.NFTSent ? 'sent' : 'received'
          } by <span class="highlight-noti">${this.cutString(data.from || data.to)}</span>`;
          break;
        case this.typeNoti.CoinSent:
        case this.typeNoti.CoinReceived:
          element.display = `<span class="highlight-noti">${
            data.transfer + (data.num >= 3 ? ' and more' : '')
          }</span> ${
            element.title === this.typeNoti.CoinSent ? 'sent' : 'received'
          } by <span class="highlight-noti">${this.cutString(data.address)}</span>`;
          break;
        default:
          element.display = data.content;
          break;
      }
    } catch {}
  }

  filterListNoti(isRead = 1) {
    if (isRead === 0) {
      this.lstData = this.lstData.filter((k) => k.is_read === 0);
    } else {
      this.lstData = this.notificationsService.lstNoti;
    }
  }

  cutString(value: string): string {
    let nameTag = '';
    if (this.commonService.setNameTag(value) !== value) {
      nameTag = ' (' + this.commonService.setNameTag(value) + ')';
    }
    const firstChar = value.substring(0, 8);
    const lastChar = value.substring(value.length - 8);
    value = firstChar + '...' + lastChar;

    return value + nameTag;
  }

  readNoti(item = {}) {
    this.notificationsService.readNoti(item['id']).subscribe(
      (res) => {
        this.getListNoti();
      },
      () => {},
      () => {
        if (item['id']) {
          this.router.navigate(['/transaction', item['tx_hash']]);
        }
      },
    );
  }
}
