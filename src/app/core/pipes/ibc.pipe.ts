import { Pipe, PipeTransform } from '@angular/core';
import { NameTagService } from '../services/name-tag.service';
import { EnvironmentService } from '../data-services/environment.service';

@Pipe({ name: 'checkIBC' })
export class checkIBCPipe implements PipeTransform {
  constructor(
    public nameTagService: NameTagService,
    private environmentService: EnvironmentService,
  ) {}
  transform(type: string, listIBCProgress: Array<any>) {
    let arrFilter = [];
    const denom = this.environmentService.chainInfo.currencies[0].coinDenom;
    arrFilter = listIBCProgress?.filter((f) => f.typeTx === type);
    arrFilter?.forEach((k) => {
      k.denom = k.denom === denom ? denom : k?.denom;
    });
    return arrFilter?.length > 0;
  }
}
