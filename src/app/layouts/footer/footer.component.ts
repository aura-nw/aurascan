import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EnvironmentService } from '../../core/data-services/environment.service';
import { MenuItem } from '../horizontaltopbar/menu.model';
import { MENU } from '../horizontaltopbar/menu';
import { DropdownElement } from 'src/app/shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})

/**
 * Footer Component
 */
export class FooterComponent implements OnInit {
  @Output() onViewSelected: EventEmitter<DropdownElement> = new EventEmitter();
  @Input() label!: string;
  chainId = this.environmentService.configValue.chainId;

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

  constructor(private environmentService: EnvironmentService, public router: Router, private route: ActivatedRoute) {}

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

  viewSelected(e: DropdownElement): void {
    this.onViewSelected.emit(e);
  }
}
