import {CommonService} from "src/app/core/services/common.service";
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'nameTag' })
export class nameTag implements PipeTransform {
  constructor(public commonService: CommonService) {}
  transform(address, listNameTag = [], getPrivate = true) {
    return this.commonService.setNameTag(address, listNameTag, getPrivate);
  }
}
