import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { from } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { EWalletType } from 'src/app/core/constants/wallet.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { MENU_MOB, MenuName } from 'src/app/layouts/horizontaltopbar/menu';
import { MenuItem } from 'src/app/layouts/horizontaltopbar/menu.model';

@Component({
  selector: 'app-menu-bottom-bar',
  templateUrl: './menu-bottom-bar.component.html',
  styleUrls: ['./menu-bottom-bar.component.scss'],
})
export class MenuBottomBarComponent implements OnInit {
  menu: MenuItem[] = MENU_MOB;
  menuName = MenuName;
  menuLink = [];
  overlayPanel = false;
  currentAddress;
  hiddenFooter = false;
  @ViewChild('popover') public popover: NgbPopover;

  constructor(
    public router: Router,
    private walletService: WalletService,
    private notificationsService: NotificationsService,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.notificationsService.hiddenFooterSubject.subscribe((res) => {
      this.hiddenFooter = res;
    });

    this.checkFeatures();

    for (let menu of this.menu) {
      if (!menu.subItems) {
        this.menuLink.push(menu.link);
      } else {
        let arr = '';
        for (let subMenu of menu.subItems) {
          arr += subMenu.link;
        }
        this.menuLink.push(arr);
      }
    }
    this.menuLink[1] += '/tx';
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };

    // check account is in whitelist (Account Bound Token)
    from([1])
      .pipe(
        delay(800),
        mergeMap((_) => this.walletService.walletAccount$),
      )
      .subscribe((wallet) => {
        if (wallet) {
          this.currentAddress = wallet.address;
        } else {
          this.currentAddress = null;
        }
      });
  }

  @HostListener('body:click', ['$event'])
  mouseleave(event) {
    const ids = [
      'blockChainBtn',
      'tokenBtn',
      'resourceBtn',
      'moreBtn',
      'blockChainIcon',
      'blockChainText',
      'resourceIcon',
      'resourceText',
      'tokenIcon',
      'tokenText',
      'moreIcon',
      'moreText',
    ];
    const id = event.target?.id;
    if (this.popover.isOpen()) {
      if (ids.indexOf(id) < 0) {
        const overlay = document.getElementById('popover-overlay');
        if (overlay) {
          overlay.click();
        }
      }
    }
  }

  checkFeatures() {
    const features = this.environmentService.chainConfig.features;

    if (features.length > 0) {
      this.menu.forEach((item) => {
        if (item.subItems) {
          let isEnabledMenu = false;
          item.subItems.forEach((subItem) => {
            const featureName = subItem.featureName;

            const foundIndex = features.findIndex((item) => item === featureName);

            // If have featureName, check disable
            subItem.disabled = featureName ? foundIndex < 0 : false;

            isEnabledMenu = subItem.disabled ? true : isEnabledMenu;
          });
        } else {
          const featureName = item.featureName;
          const foundIndex = features.findIndex((item) => item === featureName);
          item.disabled = foundIndex < 0;
        }
      });
    }
  }

  overLayClickEvent() {
    this.overlayPanel = false;
  }
}
