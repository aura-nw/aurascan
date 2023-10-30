import { Component, OnInit } from '@angular/core';
import { TOKEN_ID_GET_PRICE } from './core/constants/common.constant';
import { CommonService } from './core/services/common.service';
import { TokenService } from './core/services/token.service';
import { getInfo } from './core/utils/common/info-common';
import { Globals } from './global/global';
// import eruda from 'eruda';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';
import { NameTagService } from './core/services/name-tag.service';
import { ValidatorService } from './core/services/validator.service';

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
  constructor(
    private commonService: CommonService,
    private globals: Globals,
    private tokenService: TokenService,
    private nameTagService: NameTagService,
    private validatorService: ValidatorService,
  ) {}
  ngOnInit(): void {
    this.getInfoCommon();
    this.getPriceToken();

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
        this.globals.listNameTag = this.commonService.listNameTag = data;
        this.getListNameTag();
      } catch (e) {
        this.getListNameTag();
      }
    } else {
      this.getListNameTag();
    }

    setInterval(() => {
      this.getInfoCommon();
    }, 60000);

    setInterval(() => {
      this.getListValidator();
      this.getPriceToken();
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
      localStorage.setItem('listNameTag', JSON.stringify(result));
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
