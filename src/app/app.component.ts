import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { forkJoin, map } from 'rxjs';
import { TOKEN_ID_GET_PRICE } from './core/constants/common.constant';
import { CommonService } from './core/services/common.service';
import { NameTagService } from './core/services/name-tag.service';
import { NotificationsService } from './core/services/notifications.service';
import { TokenService } from './core/services/token.service';
import { ValidatorService } from './core/services/validator.service';
import { WatchListService } from './core/services/watch-list.service';
import { getInfo } from './core/utils/common/info-common';
import { Globals } from './global/global';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  // TESTNET = ['aura-testnet-2', 'serenity-testnet-001'];
  // isTestnet = this.TESTNET.includes(
  //   this.chainInfo?.chainId || ''
  // );
  isFirstLoad = true;
  userEmail = '';
  constructor(
    private commonService: CommonService,
    private globals: Globals,
    private tokenService: TokenService,
    private nameTagService: NameTagService,
    private validatorService: ValidatorService,
    private notificationsService: NotificationsService,
    private watchListService: WatchListService,
  ) {}
  ngOnInit(): void {
    this.userEmail = localStorage.getItem('userEmail');
    this.getInfoCommon();
    this.getPriceToken();
    this.getDataFromStorage();
    //get list token market
    this.tokenService.getCoinData();

    setInterval(() => {
      this.getInfoCommon();
    }, 60000);

    setInterval(() => {
      this.getListValidator();
      this.getPriceToken();
      //get list token market
      this.tokenService.getCoinData();
    }, 600000);

    // if (this.isTestnet) {
    //   let el = document.createElement('div');
    //   document.body.appendChild(el);
    //
    //   eruda.init({
    //     container: el,
    //     tool: ['console', 'elements', 'resources', 'network'],
    //   });
    // }
  }

  getInfoCommon(): void {
    this.commonService.status().subscribe((res) => {
      getInfo(this.globals, res);
    });
  }

  getPriceToken(): void {
    this.tokenService.getPriceToken(TOKEN_ID_GET_PRICE.AURA).subscribe((res) => {
      this.globals.price.aura = res.data || 0;
    });
  }

  getListNameTag() {
    const payload = {
      limit: 500,
      nextKey: 0,
    };

    // get list name tag if not login email
    if (!this.userEmail) {
      this.nameTagService.getListNameTag(payload).subscribe((res) => {
        this.nameTagService.listNameTag = res.data?.nameTags;
        localStorage.setItem('listNameTag', JSON.stringify(res.data?.nameTags));
      });
    } else {
      const payloadPrivate = {
        limit: 100,
        offset: 0,
        keyword: null,
      };

      // get list name tag if login email
      forkJoin({
        publicName: this.nameTagService.getListNameTag(payload),
        privateName: this.nameTagService.getListPrivateNameTag(payloadPrivate),
      }).subscribe(({ publicName, privateName }) => {
        const listNameTag = publicName.data?.nameTags?.map((element) => {
          const address = _.get(element, 'address');
          const name_tag = _.get(element, 'name_tag');
          const enterpriseUrl = _.get(element, 'enterpriseUrl');

          let isPrivate = false;
          let name_tag_private = null;
          let id = null;

          let privateData = privateName?.data?.find((k) => k.address === address);

          if (privateData) {
            name_tag_private = privateData.nameTag;
            isPrivate = true;
            id = privateData.id;
          }
          return { address, name_tag, isPrivate, enterpriseUrl, name_tag_private, id };
        });

        // get other data of private list
        const isSameUser = (listTemp, privateName) => listTemp?.address === privateName.address;
        const onlyInLeft = (left, right, compareFunction) =>
          left.filter((leftValue) => !right.some((rightValue) => compareFunction(leftValue, rightValue)));
        const lstPrivate = onlyInLeft(privateName?.data, listNameTag, isSameUser);

        lstPrivate.forEach((element) => {
          element['name_tag_private'] = element.nameTag;
          element['nameTag'] = null;
          element['isPrivate'] = true;
        });
        const result = [...listNameTag, ...lstPrivate];
        this.nameTagService.listNameTag = result;
        localStorage.setItem('listNameTag', JSON.stringify(result));
      });
    }
  }

  getListValidator(): void {
    this.validatorService.getListNameValidator(null).subscribe((res) => {
      if (res.validator?.length > 0) {
        this.commonService.listValidator = res.validator;
        localStorage.setItem('listValidator', JSON.stringify(this.commonService.listValidator));
      }
    });
  }

  getDataFromStorage() {
    // get list name validator form local storage
    const listValidatorName = localStorage.getItem('listValidator');
    if (!listValidatorName) {
      this.getListValidator();
    } else {
      try {
        let data = JSON.parse(listValidatorName);
        this.commonService.listValidator = data;
      } catch (e) {
        this.getListValidator();
      }
    }

    // get name tag form local storage
    const listNameTag = localStorage.getItem('listNameTag');
    if (listNameTag) {
      try {
        let data = JSON.parse(listNameTag);
        this.nameTagService.listNameTag = data;
        this.getListNameTag();
      } catch (e) {
        this.getListNameTag();
      }
    } else {
      this.getListNameTag();
    }

    // get watch list form local storage
    if (this.userEmail) {
      this.getWatchlist();
      // check register fcm token
      const registerFCM = localStorage.getItem('registerFCM');
      if (registerFCM == 'true') {
        this.notificationsService.registerFcmToken();
      }
    }

    // get list name validator form local storage
    const listTokenIBC = localStorage.getItem('listTokenIBC');
    if (!listTokenIBC) {
      this.getListTokenIBC();
    } else {
      try {
        let data = JSON.parse(listTokenIBC);
        this.commonService.listTokenIBC = data;
        this.getListTokenIBC();
      } catch (e) {
        this.getListTokenIBC();
      }
    }
  }

  getWatchlist() {
    const payload = {
      limit: 100,
      offset: 0,
    };

    this.watchListService.getListWatchList(payload).subscribe((res) => {
      localStorage.setItem('lstWatchList', JSON.stringify(res?.data));
    });
  }

  getListTokenIBC(): void {
    const payload = {
      onlyIbc: true,
    };
    this.tokenService
      .getTokenMarketData(payload)
      .pipe(
        map((res) => {
          return res.map((element) => ({
            ...element,
            display: element['display'] || element['symbol'],
          }));
        }),
      )
      .subscribe((listTokenIBC) => {
        localStorage.setItem('listTokenIBC', JSON.stringify(listTokenIBC));
      });
  }
}
