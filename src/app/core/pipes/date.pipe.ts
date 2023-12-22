import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNowStrict } from 'date-fns';
import * as moment from 'moment';
import { DATEFORMAT } from 'src/app/core/constants/common.constant';
import { formatTimeInWords, formatWithSchema } from 'src/app/core/helpers/date';

@Pipe({ name: 'dateCustom' })
export class DateCustomPipe implements PipeTransform {
  constructor() {}
  transform(time, isCustom = true) {
    if (time) {
      try {
        //get custom function format date if isCustom
        if (isCustom) {
          return [
            formatTimeInWords(new Date(time).getTime()),
            `(${formatWithSchema(new Date(time).getTime(), DATEFORMAT.DATETIME_UTC)})`,
          ];
        } else {
          if (+moment(time).format('x') - +moment().format('x') > 0) {
            return [
              formatWithSchema(new Date(time).getTime(), DATEFORMAT.DATETIME_UTC),
              formatDistanceToNowStrict(new Date(time).getTime()) + ' remaining',
            ];
          } else {
            return [
              formatTimeInWords(new Date(time).getTime()),
              `${formatWithSchema(new Date(time).getTime(), DATEFORMAT.DATETIME_UTC)}`,
            ];
          }
        }
      } catch (e) {
        return [time, ''];
      }
    } else {
      return ['-', ''];
    }
  }
}

@Pipe({ name: 'customDateTime' })
export class CustomTimeDatePipe implements PipeTransform {
  transform(value: string, format: 'Distance' | 'DateOnly' | 'TimeOnly' | 'DateTime') {
    if (value) {
      const dateValue = moment(value).toDate();

      switch (format) {
        case 'Distance':
          if (moment().isBefore(dateValue)) {
            return formatDistanceToNowStrict(dateValue) + ' remaining';
          }
          return formatTimeInWords(dateValue);
        case 'DateOnly':
          return formatWithSchema(dateValue, DATEFORMAT.DATE_ONLY);
        case 'TimeOnly':
          return formatWithSchema(dateValue, DATEFORMAT.TIME_ONLY);
        default:
          return formatWithSchema(dateValue, DATEFORMAT.DATETIME_UTC);
      }
    }
    return value;
  }
}
