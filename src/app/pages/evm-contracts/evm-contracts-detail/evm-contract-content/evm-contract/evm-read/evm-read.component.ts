import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Contract, JsonFragment } from 'ethers';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { READ_STATE_MUTABILITY } from 'src/app/core/models/evm-contract.model';
import { getEthersProvider } from 'src/app/core/utils/ethers';
import { validateAndParsingInput } from 'src/app/core/utils/ethers/validate';

type Error = {
  code?: string;
  message?: string
}

type JsonFragmentExtends = JsonFragment & {
  formGroup?: FormGroup;
  isValidate?: boolean;
  result?: string;
  isLoading?: boolean;
  error?: Error;
};

@Component({
  selector: 'app-evm-read',
  templateUrl: './evm-read.component.html',
  styleUrls: ['./evm-read.component.scss'],
})
export class EvmReadComponent implements OnChanges {
  @Input() contractAddress: string;
  @Input() abi: JsonFragment[];
  @Input() isProxyContract = false;

  isExpand = false;
  chainInfo = this.environmentService.chainInfo;

  extendedAbi: JsonFragmentExtends[];
  contract: Contract;

  constructor(
    private environmentService: EnvironmentService,
    private fb: FormBuilder,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['abi']) {
      const extendedAbi: JsonFragmentExtends[] =
        this.abi?.filter(
          (abi: JsonFragment) => READ_STATE_MUTABILITY.includes(abi.stateMutability) && abi.type == 'function',
        ) || [];

      extendedAbi.forEach((abi) => {
        const group = abi.inputs.reduce((prevValue, curValue, idx) => {
          const control = this.fb.control('', Validators.required);
          return {
            ...prevValue,
            [curValue.name || idx]: control,
          };
        }, {});

        abi['formGroup'] = this.fb.group(group);
      });

      this.extendedAbi = extendedAbi;
    }
    this.resetForm();
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

  afterExpand(jsonFragment: JsonFragmentExtends) {
    if (jsonFragment.inputs?.length == 0 && !jsonFragment.result) {
      this.handleQueryContract(jsonFragment);
    }
  }

  handleQueryContract(jsonFragment: JsonFragmentExtends) {
    if (!jsonFragment) {
      return;
    }

    jsonFragment.isValidate = true;

    const { formGroup, inputs, name } = jsonFragment;

    if (formGroup.invalid) {
      return;
    }

    const formControls = formGroup.controls;

    const params = inputs?.map((i, idx) => {
      const value = formControls[i.name || idx].value?.trim();
      return validateAndParsingInput(i, value); // TODO
    });

    const contract = this.createContract();

    if (!contract) {
      return;
    }

    jsonFragment.isLoading = true;
    jsonFragment.result = undefined;
    jsonFragment.error = undefined;
    contract[name]?.(...params)
      .then((res) => {
        jsonFragment.result = res;
        jsonFragment.isLoading = false;
        jsonFragment.error = undefined;
      })
      .catch((error) => {
        jsonFragment.isLoading = false;
        jsonFragment.error = { code: error.code, message: error.message };
      });
  }

  reloadData() {
    this.expandMenu(true);
    this.isExpand = false;

    this.resetForm();
  }

  resetForm() {
    this.extendedAbi.forEach((ea) => {
      ea.formGroup.reset();
      ea.isValidate = false;
      ea.result = undefined;
    });
  }
}
