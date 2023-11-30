import {CommonService} from "src/app/core/services/common.service";
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'checkPublic' })
export class CheckPublic implements PipeTransform {
  constructor(public commonService: CommonService) {}
  transform(address, listNameTag = []) {
    return this.commonService.checkPublic(address, listNameTag);
  }
}
