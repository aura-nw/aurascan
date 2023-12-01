import { ViewportScroller } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { EventService } from '../core/services/event.service';
import {
  LAYOUT_HORIZONTAL,
  LAYOUT_MODE,
  LAYOUT_POSITION,
  LAYOUT_WIDTH,
  SIDEBAR_COLOR,
  SIDEBAR_SIZE,
  TOPBAR,
} from './layouts.model';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})

/**
 * Layout Component
 */
export class LayoutComponent implements OnInit {
  pageYOffset = 0;
  scrolling = false;
  @HostListener('window:scroll', ['$event']) onScroll(event) {
    this.pageYOffset = window.pageYOffset;
  }

  constructor(private scroll: ViewportScroller) {}

  ngOnInit() {
    this.LayoutMode(LAYOUT_MODE);
    this.LayoutWidth(LAYOUT_WIDTH);
    this.LayoutPosition(LAYOUT_POSITION);
    this.Topbar(TOPBAR);
    this.SidebarColor(SIDEBAR_COLOR);
    this.SidebarSize(SIDEBAR_SIZE);
  }

  /**
   * Layout Mode Set
   */
  LayoutMode(mode: string) {
    switch (mode) {
      case 'light':
        document.body.setAttribute('data-layout-mode', 'light');
        document.body.setAttribute('data-topbar', 'light');
        document.body.setAttribute('data-sidebar', 'light');
        break;
      case 'dark':
        document.body.setAttribute('data-sidebar', 'dark');
        document.body.setAttribute('data-layout-mode', 'dark');
        document.body.setAttribute('data-topbar', 'dark');
        break;
      default:
        document.body.setAttribute('data-layout-mode', 'light');
        document.body.setAttribute('data-topbar', 'light');
        break;
    }
  }

  /**
   * Layout Width Set
   */
  LayoutWidth(width: string) {
    switch (width) {
      case 'light':
        document.body.setAttribute('data-layout-size', 'fluid');
        break;
      case 'boxed':
        document.body.setAttribute('data-layout-size', 'boxed');
        break;
      default:
        document.body.setAttribute('data-layout-size', 'light');
        break;
    }
  }

  /**
   * Layout Position Set
   */
  LayoutPosition(position: string) {
    if (position === 'fixed') {
      document.body.setAttribute('data-layout-scrollable', 'false');
    } else {
      document.body.setAttribute('data-layout-scrollable', 'true');
    }
  }

  /**
   * Layout Sidebar Color Set
   */
  SidebarColor(color: string) {
    switch (color) {
      case 'light':
        document.body.setAttribute('data-sidebar', 'light');
        break;
      case 'dark':
        document.body.setAttribute('data-sidebar', 'dark');
        break;
      case 'brand':
        document.body.setAttribute('data-sidebar', 'brand');
        break;
      default:
        document.body.setAttribute('data-sidebar', 'light');
        break;
    }
  }

  /**
   * Layout Topbar Set
   */
  Topbar(topbar: string) {
    switch (topbar) {
      case 'light':
        document.body.setAttribute('data-topbar', 'light');
        break;
      case 'dark':
        document.body.setAttribute('data-topbar', 'dark');
        break;
      default:
        document.body.setAttribute('data-topbar', 'light');
        break;
    }
  }

  /**
   * Layout Sidebar Size Set
   */
  SidebarSize(size: string) {
    switch (size) {
      case 'default':
        document.body.setAttribute('data-sidebar-size', 'lg');
        break;
      case 'compact':
        document.body.setAttribute('data-sidebar-size', 'md');
        break;
      case 'small':
        document.body.setAttribute('data-sidebar-size', 'sm');
        break;
      default:
        document.body.setAttribute('data-sidebar-size', 'lg');
        break;
    }
  }

  scrollToTop() {
    this.scroll.scrollToPosition([0, 0]);
    this.scrolling = true;
    setTimeout(() => {
      this.scrolling = !this.scrolling;
    }, 500);
  }
}
