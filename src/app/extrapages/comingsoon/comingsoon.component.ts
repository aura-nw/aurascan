import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';
import { map } from 'rxjs/internal/operators';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-comingsoon',
  templateUrl: './comingsoon.component.html',
  styleUrls: ['./comingsoon.component.scss']
})

/**
 * ComingSoon Component
 */
export class ComingsoonComponent implements OnInit {

  private _trialEndsAt: any;

  constructor() { }

  private _diff?: any;
  _days?: number;
  _hours?: number;
  _minutes?: number;
  _seconds?: number;

  ngOnInit(): void {
    // Date Set
    this._trialEndsAt = "2021-12-31";

    /**
     * Count date set
     */
    interval(1000).pipe(
      map((x) => {
        this._diff = Date.parse(this._trialEndsAt) - Date.parse(new Date().toString());
      })).subscribe((x) => {
        this._days = this.getDays(this._diff);
        this._hours = this.getHours(this._diff);
        this._minutes = this.getMinutes(this._diff);
        this._seconds = this.getSeconds(this._diff);
      });
  }

  /**
   * Day Set
   */
  getDays(t: number) {
    return Math.floor(t / (1000 * 60 * 60 * 24));
  }

  /**
   * Hours Set
   */
  getHours(t: number) {
    return Math.floor((t / (1000 * 60 * 60)) % 24);
  }

  /**
   * Minutes set
   */
  getMinutes(t: number) {
    return Math.floor((t / 1000 / 60) % 60);
  }

  /**
   * Secound set
   */
  getSeconds(t: number) {
    return Math.floor((t / 1000) % 60);
  }

  // Coin News Slider
  timelineCarousel: OwlOptions = {
    items: 1,
    loop: false,
    margin: 0,
    nav: false,
    navText: ["", ""],
    dots: true,
    responsive: {
      680: {
        items: 1
      },
    }
  }
}
