import { Component, OnDestroy, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { forkJoin, Subject, takeUntil, timer } from 'rxjs';
import { CoingeckoService } from './core/data-services/coingecko.service';
import { CommonService } from './core/services/common.service';
import { NameTagService } from './core/services/name-tag.service';
import { ValidatorService } from './core/services/validator.service';
import { getInfo } from './core/utils/common/info-common';
import { Globals } from './global/global';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  isFirstLoad = true;

  destroyed$ = new Subject();
  constructor(
    private commonService: CommonService,
    private globals: Globals,
    private nameTagService: NameTagService,
    private validatorService: ValidatorService,
    private coingeckoService: CoingeckoService,
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    // Get coins price 1 time
    this.getCoinsMarket();

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

  getCoinsMarket(): void {
    this.coingeckoService.getCoinMarkets().subscribe((data) => {
      this.coingeckoService.coinsMarket = data;
    });
  }

  async getListNameTag() {
    const payload = {
      limit: 500,
      nextKey: 0,
    };

    const payloadPrivate = {
      limit: 100,
      offset: 0,
      keyword: null,
    };

    // get list name tag if not login email
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      await this.commonService.getListNameTag(payload).subscribe((res) => {
        this.globals.listNameTag = this.commonService.listNameTag = res.data?.nameTags;
        localStorage.setItem('listNameTag', JSON.stringify(res.data?.nameTags));
      });
      return;
    }

    // get list name tag if login email
    forkJoin({
      publicName: this.commonService.getListNameTag(payload),
      privateName: this.nameTagService.getListPrivateNameTag(payloadPrivate),
    }).subscribe(({ publicName, privateName }) => {
      let listTemp = publicName.data?.nameTags?.map((element) => {
        const address = _.get(element, 'address');
        let name_tag = _.get(element, 'name_tag');
        let isPrivate = false;
        let name_tag_private = null;
        let id;
        const enterpriseUrl = _.get(element, 'enterpriseUrl');
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
      const lstPrivate = onlyInLeft(privateName?.data, listTemp, isSameUser);
      lstPrivate.forEach((element) => {
        element['name_tag_private'] = element.nameTag;
        element['nameTag'] = null;
        element['isPrivate'] = true;
      });
      const result = [...listTemp, ...lstPrivate];
      this.globals.listNameTag = this.commonService.listNameTag = result;
    });
  }

  getListValidator(): void {
    this.validatorService.getListNameValidator(null).subscribe((res) => {
      if (res.validator?.length > 0) {
        this.commonService.listValidator = res.validator;
        localStorage.setItem('listValidator', JSON.stringify(this.commonService.listValidator));
      }
    });
  }
}
