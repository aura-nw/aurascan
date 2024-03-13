import { Component, Input } from '@angular/core';
import _ from 'lodash';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { JsonAbi, READ_STATE_MUTABILITY } from 'src/app/core/models/evm-contract.model';

@Component({
  selector: 'app-evm-read',
  templateUrl: './evm-read.component.html',
  styleUrls: ['./evm-read.component.scss'],
})
export class EvmReadComponent {
  @Input() abi: JsonAbi[];

  isExpand = false;
  chainInfo = this.environmentService.chainInfo;

  get readAbi() {
    return this.abi?.filter((abi: JsonAbi) => READ_STATE_MUTABILITY.includes(abi.stateMutability)) || [];
  }

  constructor(private environmentService: EnvironmentService) {}

  expandMenu(closeAll = false): void {
    for (let i = 0; i < document.getElementsByClassName('content-contract').length; i++) {
      let element: HTMLElement = document.getElementsByClassName('content-contract')[i] as HTMLElement;
      let expand = element.getAttribute('aria-expanded');
      if (closeAll) {
        if (expand == 'true') {
          element.click();
        }
      } else {
        if (expand === this.isExpand.toString()) {
          element.click();
        }
      }
    }
    if (!closeAll) {
      this.isExpand = !this.isExpand;
    }
  }

  handleQueryContract(msg) {
    console.log('🐛 msg: ', msg);
  }

  reloadData() {
    this.expandMenu(true);
    this.clearAllError(true);
    this.isExpand = false;
  }

  clearAllError(all = false) {
    // this.root?.forEach((msg) => {
    //   this.resetError(msg, all);
    //   if (msg.fieldList && msg.fieldList.length && all) msg.dataResponse = '';
    // });
  }

  resetError(msg, all = false) {
    if (msg) {
      const { fieldList } = msg;
      fieldList.forEach((item) => {
        _.assign(
          item,
          all
            ? {
                isError: false,
                value: '',
              }
            : {
                isError: false,
              },
        );
      });
    }
  }
}
