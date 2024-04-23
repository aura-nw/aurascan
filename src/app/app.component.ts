import { Component, OnDestroy, OnInit } from '@angular/core';
import BigNumber from 'bignumber.js';
import eruda from 'eruda';
import * as _ from 'lodash';
import { Subject, forkJoin, map, takeUntil } from 'rxjs';
import { STORAGE_KEYS } from './core/constants/common.constant';
import { ETokenCoinTypeBE } from './core/constants/token.constant';
import { EnvironmentService } from './core/data-services/environment.service';
import { IUser } from './core/models/auth.models';
import { CommonService } from './core/services/common.service';
import { IBCService } from './core/services/ibc.service';
import { NameTagService } from './core/services/name-tag.service';
import { NotificationsService } from './core/services/notifications.service';
import { TokenService } from './core/services/token.service';
import { UserService } from './core/services/user.service';
import { ValidatorService } from './core/services/validator.service';
import { WatchListService } from './core/services/watch-list.service';
import { getInfo } from './core/utils/common/info-common';
import local from './core/utils/storage/local';
import { Globals } from './global/global';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  TESTNET = ['auradev_1235-3', 'serenity-testnet-001'];
  isTestnet = this.TESTNET.includes(this.environmentService.chainInfo?.chainId || '');
  isFirstLoad = true;
  user: IUser;

  destroyed$ = new Subject<void>();
  coinMinimalDenom = this.environmentService.chainInfo.currencies[0].coinMinimalDenom;
  excludedAddresses = this.environmentService.chainConfig.excludedAddresses;

  constructor(
    private commonService: CommonService,
    private globals: Globals,
    private tokenService: TokenService,
    private nameTagService: NameTagService,
    private validatorService: ValidatorService,
    private notificationsService: NotificationsService,
    private watchListService: WatchListService,
    private userService: UserService,
    private environmentService: EnvironmentService,
    private ibcService: IBCService,
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.userService.user$?.pipe(takeUntil(this.destroyed$)).subscribe((user) => {
      this.user = user;

      this.getListNameTag();

      if (this.user?.accessToken) {
        this.getWatchlist();
        // check register fcm token
        const registerFCM = local.getItem(STORAGE_KEYS.REGISTER_FCM);
        if (registerFCM == 'true') {
          this.notificationsService.registerFcmToken();
        }
      }
    });

    this.getInfoCommon();
    this.getDataFromStorage();
    //get list token market
    this.tokenService.getCoinData();

    setInterval(() => {
      this.getInfoCommon();
    }, 60000);

    setInterval(() => {
      this.getListValidator();
      //get list token market
      this.tokenService.getCoinData();
    }, 600000);

    if (this.TESTNET) {
      let el = document.createElement('div');
      document.body.appendChild(el);

      eruda.init({
        container: el,
        tool: ['console', 'elements', 'resources', 'network'],
      });
    }
  }

  getInfoCommon(): void {
    this.commonService.status().subscribe({
      next: (res) => {
        console.log(res);
        getInfo(this.globals, res, this.environmentService.coinDecimals);
        this.environmentService.setLatestBlockHeight(res?.total_blocks || null);
      },
      error: () => {
        this.environmentService.setLatestBlockHeight(null);
      },
    });
  }

  getListNameTag() {
    const payload = {
      limit: 500,
      nextKey: 0,
    };

    // get list name tag if not login email
    if (!this.user?.accessToken) {
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

    // get list token IBC
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
          const nativeData = res?.find((k) => k.denom === this.coinMinimalDenom);
          if (nativeData?.coinId) {
            this.getDataNative(nativeData);
          }

          const listFilterIBC = res?.filter((k) => k.type === ETokenCoinTypeBE.IBC);
          return listFilterIBC?.map((element) => ({
            ...element,
            display: element['display'] || element['symbol'],
          }));
        }),
      )
      .subscribe((listTokenIBC) => {
        local.setItem(STORAGE_KEYS.LIST_TOKEN_IBC, listTokenIBC);
      });
  }

  async getDataNative(nativeData) {
    const tempTotal = await this.ibcService.getTotalSupplyLCD(this.coinMinimalDenom).catch(() => '0');
    nativeData['totalSupply'] = BigNumber(_.get(tempTotal, 'data.amount.amount') || '0').toFixed();
    local.setItem(STORAGE_KEYS.DATA_NATIVE, nativeData);
  }
}
