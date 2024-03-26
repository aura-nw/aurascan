import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { UserService } from 'src/app/core/services/user.service';
import { isSafari } from 'src/app/core/utils/common/validation';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent {
  @ViewChild('notiMenu') notiMenu: ElementRef;

  isTabAll = true;
  lstData = [];
  lstDataUnread = [];
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

  currentOffset = 0;
  lengthQuery = 100;
  clickNoti = false;
  countAll = 0;
  isSafari = false;
  countRecallNoti = 0;

  quotaNotification = this.environmentService.chainConfig.quotaNotification;
  dataWarning = {
    linkWatchList: true,
    image: 'assets/icons/icons-svg/color/noti-quota.svg',
    display:
      'You have reached out your daily quota limit of ' +
      this.quotaNotification +
      ' notifications per day. Kindly go to your watchlist to turn on the' +
      ' notification mode and adjust your current configuration for your watchlist’s addresses and group of tracking activities to avoid over quota again',
  };

  constructor(
    public notificationsService: NotificationsService,
    private router: Router,
    private environmentService: EnvironmentService,
    private nameTagService: NameTagService,
    private userService: UserService,
  ) {}

  onScroll(event): void {
    const scrollItem = document.getElementById('scrollBox');
    if (scrollItem.scrollTop + 800 >= scrollItem.scrollHeight) {
      if (!this.isLoading && this.currentOffset < this.countAll) {
        this.currentOffset = this.currentOffset + this.lengthQuery;
        this.getListNoti(false);
      }

      setTimeout(() => {
        this.isLoading = false;
      }, 5000);
    }
  }

  ngOnInit(): void {
    this.isSafari = isSafari();
    // check exit email
    const userEmail = this.userService.getCurrentUser()?.email;
    if (!userEmail) {
      return;
    }

    if (this.isInit) {
      this.notificationsService.init();
      if (!this.notificationsService.currentFcmToken) {
        this.getListNoti(this.isInit, true);
      }
      this.isInit = false;
    }

    this.notificationsService.notificationStore$.subscribe((res) => {
      if (res?.length > 0 && !this.loadNewNoti) {
        this.loadNewNoti = true;
        this.currentOffset = 0;
        if (this.lstData?.length >= this.quotaNotification) {
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
    if (document.getElementById('typeAction')?.classList.contains('show')) {
      this.clickNoti = !this.clickNoti;
    }
    if (this.isFirstLoad) {
      this.getListNoti();
      this.isFirstLoad = false;

      setTimeout(() => {
        this.getQuotaNoti(true);
      }, 1000);
    }

    if (this.notificationsService.isMobileMatched) {
      this.notificationsService.hiddenFooterSubject.next(true);
    }
  }

  getListNoti(isInit = true, unread = false) {
    this.isLoading = true;
    const payload = {
      limit: this.lengthQuery,
      offset: this.currentOffset,
      unread: unread,
    };
    this.notificationsService.getListNoti(payload).subscribe(
      (res) => {
        this.notificationsService.countUnread = res.meta?.countUnread;
        if (unread) {
          return;
        }
        res.data.forEach((element) => {
          this.handleDisplayNoti(element);
        });
        this.countAll = res.meta?.count;

        if (isInit) {
          this.notificationsService.lstNoti = this.lstData = res.data;
        } else {
          this.lstData.push(...res.data);
        }
        this.filterListNoti();
      },
      () => {
        if (this.countRecallNoti < 5) {
          setTimeout(() => {
            this.countRecallNoti++;
            this.getListNoti(true);
          }, 15000);
        }
      },
      () => {
        this.isLoading = false;
      },
    );
  }

  getQuotaNoti(isInit = false) {
    this.notificationsService.getQuotaNoti().subscribe((res) => {
      if (res.total >= this.quotaNotification) {
        if (!this.notificationsService.lstNoti[0]?.linkWatchList) {
          this.dataWarning['created_at'] = res.updated_at || Date.now();
          this.notificationsService.lstNoti.unshift(this.dataWarning);
        }
      } else if (!isInit) {
        this.getListNoti();
      }
    });
  }

  handleDisplayNoti(element) {
    try {
      const data = element.body.data;
      if (element.image?.length > 0) {
        element.image = this.handleImage(element.image);
      }
      switch (element.title) {
        case this.typeNoti.Executed:
          element.icon = 'icon icon-noti-executed';
          element.display = `New <span class="highlight-noti">${
            data.type
          }</span> transaction initiated by <span class="highlight-noti">${this.cutString(data.sender)}</span>`;
          break;
        case this.typeNoti.TokenSent:
        case this.typeNoti.TokenReceived:
          element.icon = 'ph-coins';
          element.display = `<span class="highlight-noti">${data.tokens + (data.num >= 3 ? ' and more' : '')}</span> ${
            element.title === this.typeNoti.TokenSent ? 'sent' : 'received'
          } by <span class="highlight-noti">${this.cutString(data.from || data.to)}</span>`;
          break;
        case this.typeNoti.NFTSent:
        case this.typeNoti.NFTReceived:
          element.icon = 'icon-nft';
          element.display = `NFT id <span class="highlight-noti">${
            data.tokens + (data.num > 2 ? ' and more' : '')
          }</span> ${
            element.title === this.typeNoti.NFTSent ? 'sent' : 'received'
          } by <span class="highlight-noti">${this.cutString(data.from || data.to)}</span>`;
          break;
        case this.typeNoti.CoinSent:
        case this.typeNoti.CoinReceived:
          element.icon = 'ph-coin';
          element.display = `<span class="highlight-noti">${
            data.transfer + (data.num >= 3 ? ' and more' : '')
          }</span> ${
            element.title === this.typeNoti.CoinSent ? 'sent' : 'received'
          } by <span class="highlight-noti">${this.cutString(data.address)}</span>`;
          break;
        default:
          element.icon = 'ph-coin';
          element.display = data.content;
          break;
      }
    } catch {
      element.icon = 'ph-coin';
    }
  }

  filterListNoti() {
    if (!this.isTabAll) {
      this.lstData = this.lstData.filter((k) => k.is_read === 0);
    } else {
      this.lstData = this.notificationsService.lstNoti;
    }
  }

  cutString(value: string): string {
    let nameTag = '';
    if (this.nameTagService.findNameTagByAddress(value) !== value) {
      nameTag = ' (' + this.nameTagService.findNameTagByAddress(value) + ')';
    }
    const firstChar = value.substring(0, 8);
    const lastChar = value.substring(value.length - 8);
    value = firstChar + '...' + lastChar;

    return value + nameTag;
  }

  readNoti(item = {}) {
    if (item['linkWatchList']) {
      this.router.navigate(['/profile'], { queryParams: { tab: 'watchList' } });
      return;
    }

    if (!item['is_read']) {
      this.notificationsService.readNoti(item['id']).subscribe(
        (res) => {},
        () => {
          this.executeLinkTX(item);
        },
        () => {
          this.executeLinkTX(item);
        },
      );
    } else {
      this.executeLinkTX(item);
    }
  }

  executeLinkTX(item) {
    if (item['id']) {
      this.router.navigate(['/tx', item['tx_hash']]);
    }
    this.updateReadStatus(item['id']);
  }

  updateReadStatus(id = null) {
    if (!id) {
      this.notificationsService.countUnread = 0;
      this.lstData.forEach((element) => {
        element.is_read = 1;
      });
      if (!this.isTabAll) {
        this.lstData = [];
      }
    }
  }

  closeNotiMob() {
    this.notiMenu.nativeElement.click();
    this.notificationsService.hiddenFooterSubject.next(false);
  }

  handleImage(img) {
    try {
      let data = JSON.parse(img);
      // skip if type = video || audio
      if (!data?.type || data.type.indexOf('video') >= 0 || data.type.indexOf('audio') >= 0) {
        return null;
      }
      return (img = data.image);
    } catch (e) {
      return img;
    }
  }
}
