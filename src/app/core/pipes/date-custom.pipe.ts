import {CommonService} from "src/app/core/services/common.service";
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'dateCustom' })
export class DateCustom implements PipeTransform {
  constructor(public commonService: CommonService) {}
  transform(time, isCustom = true) {
    return this.commonService.getDateValue(time, isCustom);
  }
}
