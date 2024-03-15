import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Contract, JsonFragment } from 'ethers';
import _ from 'lodash';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { READ_STATE_MUTABILITY } from 'src/app/core/models/evm-contract.model';
import { getEthersProvider } from 'src/app/core/utils/ethers';

@Component({
  selector: 'app-evm-read',
  templateUrl: './evm-read.component.html',
  styleUrls: ['./evm-read.component.scss'],
})
export class EvmReadComponent implements OnChanges {
  @Input() contractAddress: string;
  @Input() abi: JsonFragment[];

  isExpand = false;
  chainInfo = this.environmentService.chainInfo;

  extendedAbi: (JsonFragment & {
    isError?: boolean;
    isRequied?: boolean;
  })[];

  contract: Contract;

  constructor(
    private environmentService: EnvironmentService,
    private fb: FormBuilder,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['abi']) {
      this.extendedAbi =
        this.abi?.filter(
          (abi: JsonFragment) => READ_STATE_MUTABILITY.includes(abi.stateMutability) && abi.type == 'function',
        ) || [];
    }
  }

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

  createContract() {
    if (this.contract) {
      return this.contract;
    }

    try {
      const provider = getEthersProvider(this.environmentService.etherJsonRpc);

      let contract = new Contract(this.contractAddress, this.abi, provider);

      if (contract) {
        this.contract = contract;

        return this.contract;
      }
    } catch (error) {
      console.error(error);
    }

    return null;
  }

  handleQueryContract(jsonFragment: JsonFragment) {
    const contract = this.createContract();

    const { name, inputs } = jsonFragment;

    contract[name]?.()
      .then((res) => {
        console.log('🐛 res: ', res);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  reloadData() {
    this.expandMenu(true);
    this.clearAllError(true);
    this.isExpand = false;
  }

  clearAllError(all = false) {}

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
