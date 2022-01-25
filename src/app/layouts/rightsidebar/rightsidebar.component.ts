import { Component, OnInit } from '@angular/core';
import { EventService } from '../../core/services/event.service';
import { LAYOUT_MODE, LAYOUT_WIDTH, TOPBAR, SIDEBAR_SIZE, SIDEBAR_COLOR, LAYOUT_POSITION } from '../layouts.model';

@Component({
  selector: 'app-rightsidebar',
  templateUrl: './rightsidebar.component.html',
  styleUrls: ['./rightsidebar.component.scss']
})

/**
 * Right Sidebar Component
 */
export class RightsidebarComponent implements OnInit {

  layout!: string | null;
  mode: string | undefined;
  width: string | undefined;
  position: string | undefined;
  topbar: string | undefined;
  sidebarcolor: string | undefined;
  sidebarsize: string | undefined;

  constructor(private eventService: EventService) { }

  ngOnInit(): void {
    this.mode = LAYOUT_MODE;
    this.width = LAYOUT_WIDTH;
    this.topbar = TOPBAR;
    this.sidebarcolor = SIDEBAR_COLOR;
    this.sidebarsize = SIDEBAR_SIZE;
    this.position = LAYOUT_POSITION;

    /**
     * horizontal-vertical layput set
     */
    this.layout = document.body.getAttribute('data-layout');
    const vertical = document.getElementById('is-layout');
    if (vertical != null) {
      vertical.setAttribute('checked', 'true');
    }
    if (this.layout == 'horizontal') {
      vertical?.removeAttribute('checked');
    }
  }

  /**
   * Hide the sidebar
   */
  public hide() {
    document.body.classList.remove('right-bar-enabled');
  }

  /**
   * Change the layout onclick
   * @param layout Change the layout
   */
  changeLayout(layout: any) {
    // this.eventService.broadcast('changeLayout', layout);
    if (layout.target.checked == true)
      this.eventService.broadcast('changeLayout', 'vertical');
    else
      this.eventService.broadcast('changeLayout', 'horizontal');
  }

  /**
   * Change the Mode onclick
   * @param mode Change the layout
   */
  changeMode(mode: string) {
    this.mode = mode;
    this.eventService.broadcast('changeMode', mode);
  }

  /**
   * Change the Width onclick
   * @param Width Change the layout
   */
  changeWidth(width: string) {
    this.width = width;
    this.eventService.broadcast('changeWidth', width);
  }

  /**
   * Change the Position onclick
   * @param Position Change the layout
   */
  changePosition(scrollable: string) {
    this.position = scrollable;
    this.eventService.broadcast('changePosition', scrollable);
  }

  /**
   * Change the Topbar onclick
   * @param topbar Change the layout
   */
  changeTopbar(topbar: string) {
    this.topbar = topbar;
    this.eventService.broadcast('changeTopbar', topbar);
  }

  /**
   * Change the Sidebar Color onclick
   * @param Sidebar Color Change the layout
   */
  changeSidebarColor(sidebarcolor: string) {
    this.sidebarcolor = sidebarcolor;
    this.eventService.broadcast('changeSidebarColor', sidebarcolor);
  }

  /**
   * Change the Sidebar Size onclick
   * @param Sidebar Size Change the layout
   */
  changeSidebarSize(sidebarsize: string) {
    this.sidebarsize = sidebarsize;
    this.eventService.broadcast('changeSidebarSize', sidebarsize);
  }

}
