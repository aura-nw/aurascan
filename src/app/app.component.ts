import { Component, OnInit } from '@angular/core';
import { STORAGE_KEYS, TOKEN_ID_GET_PRICE } from './core/constants/common.constant';
import { CommonService } from './core/services/common.service';
import { TokenService } from './core/services/token.service';
import { getInfo } from './core/utils/common/info-common';
import { Globals } from './global/global';
// import eruda from 'eruda';
import * as _ from 'lodash';
import { forkJoin, Subject, takeUntil, timer } from 'rxjs';
import { CoingeckoService } from './core/data-services/coingecko.service';
import { CommonService } from './core/services/common.service';
import { NameTagService } from './core/services/name-tag.service';
import { NotificationsService } from './core/services/notifications.service';
import { ValidatorService } from './core/services/validator.service';
import { WatchListService } from './core/services/watch-list.service';
import local from './core/utils/storage/local';
import { UserStorage } from './core/models/auth.models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  isFirstLoad = true;
  userEmail = '';
  destroyed$ = new Subject();
  constructor(
    private commonService: CommonService,
    private globals: Globals,
    private tokenService: TokenService,
    private nameTagService: NameTagService,
    private validatorService: ValidatorService,
    private coingeckoService: CoingeckoService,
    private notificationsService: NotificationsService,
    private watchListService: WatchListService,
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.userEmail = local.getItem<UserStorage>(STORAGE_KEYS.USER_DATA)?.email;
    // Get coins price 1 time
    this.getCoinsMarket();
    this.getDataFromStorage();

    timer(0, 60000)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((count) => {
        this.getStatistics();

        if (count == 0) {
          // get list name validator form local storage in the first time
          const listValidatorName = localStorage.getItem('listValidator');

          try {
            let data = JSON.parse(listValidatorName);
            this.commonService.listValidator = data;
          } catch (e) {
            this.getListValidator();
          }
        } else {
          this.getListValidator();
        }
      });

    // get name tag form local storage
    const listNameTag = localStorage.getItem('listNameTag');
    const userEmail = localStorage.getItem('userEmail');

    if (listNameTag && !userEmail && this.isFirstLoad) {
      try {
        let data = JSON.parse(listNameTag);
        this.globals.listNameTag = this.commonService.listNameTag = data;
        this.isFirstLoad = false;
      } catch (e) {
        this.getListNameTag();
      }
    } else {
      this.getListNameTag();
    }
  }

  getStatistics(): void {
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
        local.setItem(STORAGE_KEYS.LIST_NAME_TAG, res.data?.nameTags);
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
        local.setItem(STORAGE_KEYS.LIST_NAME_TAG, result);
      });
    }
  }

  getListValidator(): void {
    this.validatorService.getListNameValidator(null).subscribe((res) => {
      if (res.validator?.length > 0) {
        this.commonService.listValidator = res.validator;
        local.setItem(STORAGE_KEYS.LIST_VALIDATOR, this.commonService.listValidator);
      }
    });
  }

  getDataFromStorage() {
    // get list name validator form local storage
    const listValidatorName = local.getItem<[]>(STORAGE_KEYS.LIST_VALIDATOR);
    this.commonService.listValidator = listValidatorName;
    this.getListValidator();

    // get name tag form local storage
    const listNameTag = local.getItem<[]>(STORAGE_KEYS.LIST_NAME_TAG);
    this.nameTagService.listNameTag = listNameTag;
    this.getListNameTag();

    // get watch list form local storage
    if (this.userEmail) {
      this.getWatchlist();
      // check register fcm token
      const registerFCM = local.getItem(STORAGE_KEYS.REGISTER_FCM);
      if (registerFCM == 'true') {
        this.notificationsService.registerFcmToken();
      }
    }

    // get list name validator form local storage
    const listTokenIBC = local.getItem<[]>(STORAGE_KEYS.LIST_TOKEN_IBC);
    if (!listTokenIBC) {
      this.commonService.listTokenIBC = listTokenIBC;
    }
    this.getListTokenIBC();
  }

  getWatchlist() {
    const payload = {
      limit: 100,
      offset: 0,
    };

    this.watchListService.getListWatchList(payload).subscribe((res) => {
      local.setItem(STORAGE_KEYS.LIST_WATCH_LIST, res?.data);
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
        local.setItem(STORAGE_KEYS.LIST_TOKEN_IBC, listTokenIBC);
      });
  }
}
