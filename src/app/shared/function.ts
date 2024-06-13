import { Injectable } from '@angular/core';
import { TokenService } from '../core/services/token.service';
import { ITokenInfo } from '../interfaces';

const SOCIAL_MEDIA = {
  github: {
    name: 'github',
    icon: 'assets/icons/icons-svg/basic/github.svg',
  },
  twitter: {
    name: 'twitter',
    icon: 'assets/icons/icons-svg/basic/twitter.svg',
  },
  facebook: {
    name: 'facebook',
    icon: 'assets/icons/icons-svg/basic/fb-circle.svg',
  },
  medium: {
    name: 'medium',
    icon: 'assets/icons/icons-svg/basic/medium.svg',
  },
  telegram: {
    name: 'telegram',
    icon: 'assets/icons/icons-svg/basic/telegram.svg',
  },
  youtube: {
    name: 'youtube',
    icon: 'assets/icons/icons-svg/basic/youtube.svg',
  },
  otherWebsite: {
    name: 'otherWebsite',
    icon: 'assets/icons/icons-svg/basic/global.svg',
  },
  discord: {
    name: 'discord',
    icon: 'assets/icons/icons-svg/basic/discord.svg',
  },
  linkedin: {
    name: 'linkedin',
    icon: 'assets/icons/icons-svg/basic/linkedIn.svg',
  },
};

@Injectable({
  providedIn: 'root',
})
export class UtilsSharedFunction {
  constructor(private tokenService: TokenService) {}

  handleSocialMedia(socialProfiles: { [key: string]: string }) {
    if (!socialProfiles) return [];

    return Object.keys(socialProfiles)
      ?.filter((key) => socialProfiles[key])
      ?.map((key) => {
        return {
          name: SOCIAL_MEDIA[key]?.name,
          icon: SOCIAL_MEDIA[key]?.icon,
          url: socialProfiles[key],
        };
      });
  }

  handleGetTokenRes = (res): ITokenInfo => {
    return {
      officialSite: res?.officialSite,
      overviewInfo: res?.overviewInfo,
      socialProfiles: this.handleSocialMedia(res?.socialProfiles),
    };
  };

  handleGetTokenInfo(address: string, cb: (res: ITokenInfo) => void) {
    this.tokenService.getTokenDetail(address).subscribe({
      next: (res) => {
        cb(this.handleGetTokenRes(res));
      },
    });
  }
}
