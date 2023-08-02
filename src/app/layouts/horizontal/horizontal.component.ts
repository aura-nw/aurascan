import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-horizontal',
  templateUrl: './horizontal.component.html',
  styleUrls: ['./horizontal.component.scss'],
})

/**
 * Horizontal Component
 */
export class HorizontalComponent implements OnInit {
  isCondensed = false;

  constructor(public router: Router) {}

  ngOnInit(): void {
    document.body.setAttribute('data-layout', 'horizontal');
    document.body.removeAttribute('data-sidebar');
  }

  /**
   * on settings button clicked from topbar
   */
  onSettingsButtonClicked() {
    document.body.classList.toggle('right-bar-enabled');
  }

  /**
   * Mobile Toggle Menu
   */
  onToggleMobileMenu() {
    const element = document.getElementById('topnav-menu-content');
    element?.classList.toggle('show');
  }
}
