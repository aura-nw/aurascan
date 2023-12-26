import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileTab } from 'src/app/core/constants/profile.enum';
import { UserService } from 'src/app/core/services/user.service';
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
      value: 'Profile settings',
    },
    {
      key: ProfileTab.PrivateNameTag,
      value: 'Private name tag',
    },
    {
      key: ProfileTab.WatchList,
      value: 'Watchlist',
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    // check exit email
    const userEmail = this.userService.getCurrentUser()?.email;
    if (!userEmail) {
      this.router.navigate(['/']);
    }

    this.route.queryParams.subscribe((params) => {
      if (params?.tab) {
        this.currentTab = params.tab;
      }
    });

    if (this.currentTab === this.profileTab.PrivateNameTag) {
      this.activeTabID = 1;
    } else if (this.currentTab === this.profileTab.WatchList) {
      this.activeTabID = 2;
    }
  }

  changeTab(tabId): void {
    this.currentTab = tabId;
    this.location.replaceState('/profile?tab=' + this.currentTab);
  }
}
