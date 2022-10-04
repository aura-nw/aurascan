import {AfterViewChecked, Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {EnvironmentService} from '../../core/data-services/environment.service';
import {MenuItem} from '../horizontaltopbar/menu.model';
import {MENU, MenuName} from '../horizontaltopbar/menu';
import {DropdownElement} from 'src/app/shared/components/dropdown/dropdown.component';
import {NgbPopover} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})

/**
 * Footer Component
 */
export class FooterComponent implements OnInit {
  @Input() label!: string;
  chainId = this.environmentService.configValue.chainId;
  @ViewChild('popover') public popover: NgbPopover;

  dashboardURL = 'dashboard';
  blocksURL = 'blocks';
  transactionURL = 'transaction';
  validatorURL = 'validators';
  governanceURL = 'proposal';
  menuItems: MenuItem[] = MENU;
  numberMenuFooter = 3;
  menuDefault: MenuItem[] = MENU;
  menuMore: MenuItem[] = MENU;
  currentUrl = '';
  menuName = MenuName;
  popOver;

  constructor(private environmentService: EnvironmentService, public router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.url.subscribe((url) => {
      if (url) {
        this.currentUrl = url[0]?.path;
      }
    });
    this.menuDefault = this.menuItems.slice(0, 4);
    this.menuDefault.push({
      id: 99,
      label: 'MENUITEMS.MORE.TEXT',
      icon: 'burger',
      link: '/more',
    });
    this.menuMore = this.menuItems.slice(4);
  }

  getUrl(url: string): string {
    return this.router.serializeUrl(this.router.createUrlTree([url]));
  }

  @HostListener('body:click', ['$event'])
  mouseleave(event) {
    const ids = ['popover-link', 'popover-icon', 'popover-text',
                 'btnDropdownStatistic', 'btnDropdownToken',
                 'btnDropdownTokenIcon', 'btnDropdownStatisticIcon',
                 'btnDropdownTokenText', 'btnDropdownStatisticText',
                 'collapseToken', 'collapseStatistic'];
    const id= event.target?.id;
    if(this.popover.isOpen()) {
      if(ids.indexOf(id) < 0){
        document.getElementById('popover-link').click();
      }
    }
  }
}
