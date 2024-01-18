import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNowStrict } from 'date-fns';
import * as moment from 'moment';
import { DATEFORMAT } from 'src/app/core/constants/common.constant';
import { formatTimeInWords, formatWithSchema } from 'src/app/core/helpers/date';

@Pipe({ name: 'customDateTime' })
export class CustomTimeDatePipe implements PipeTransform {
  transform(value: string, format: 'Distance' | 'DateOnly' | 'TimeOnly' | 'DateTime') {
    if (value) {
      try {
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
      } catch (_) {
        // Return value if invalid value input
        return value;
      }
    }
    return '-';
  }
}
