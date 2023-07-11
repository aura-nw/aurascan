import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {

  currentPage: 'setting' | 'nameTage' | 'watchlist' = "setting";

  constructor(
    private route: ActivatedRoute,) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if(params?.tab) {
        this.currentPage = params.tab
      }
    });
  }
}
