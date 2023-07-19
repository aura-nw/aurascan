import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileTab } from 'src/app/core/constants/profile.enum';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileTab = ProfileTab;
  currentTab = ProfileTab.Setting;
  activeTabID = 0;
  PROFILE_TAB = [
    {
      key: ProfileTab.Setting,
      value: 'Profile settings'
    },
    {
      key: ProfileTab.PrivateNameTag,
      value: 'Private name tag'
    },
    {
      key: ProfileTab.WatchList,
      value: 'Watchlist'
    }
  ]

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // check exit email
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      this.router.navigate(['/']);
    }

    this.route.queryParams.subscribe((params) => {
      if (params?.tab) {
        this.currentTab = params.tab;
      }
    });
  }

  changeTab(tabId): void {
    this.currentTab = tabId;
  }
}
