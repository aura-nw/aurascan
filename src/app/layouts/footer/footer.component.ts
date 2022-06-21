import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { EnvironmentService } from '../../core/data-services/environment.service';
import { MenuItem } from '../horizontaltopbar/menu.model';
import { MENU } from '../horizontaltopbar/menu';
import { DROPDOWN_ELEMENT } from 'src/app/core/models/contract.model';
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
  chainId = this.environmentService.apiUrl.value.chainId;

  dashboardURL = 'dashboard';
  blocksURL = 'blocks';
  transactionURL = 'transaction';
  validatorURL = 'validators';
  governanceURL = 'proposal';
  menuItems: MenuItem[] = MENU;
  numberMenuFooter = 3;
  menuDefault : MenuItem[] = MENU;
  menuMore : MenuItem[] = MENU;
  elements: DropdownElement[] = DROPDOWN_ELEMENT;
  isClickMore = false;
  
  constructor(private environmentService: EnvironmentService, public router: Router) {}

  ngOnInit(): void {
    console.log(this.menuItems);
    this.menuDefault = this.menuItems.slice(0, 4);
    this.menuDefault.push({
      id: 99,
      label: 'MENUITEMS.MORE.TEXT',
      icon: 'burger',
      link: '/more',
    })
    this.menuMore = this.menuItems.slice(4);
    console.log(this.menuMore);
    
  }

  getUrl(url: string): string {
    return this.router.serializeUrl(this.router.createUrlTree([url]));
  }

  viewSelected(e: DropdownElement): void {
    this.onViewSelected.emit(e);
  }
}
