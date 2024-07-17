import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-decode-message',
  templateUrl: './decode-message.component.html',
  styleUrls: ['./decode-message.component.scss'],
})
export class DecodeMessageComponent implements OnInit {
  @Input() index?: string;
  @Input() isLink?: boolean;
  @Input() name?: string;
  @Input() isAllowSwitchDecode?: boolean;
  @Input() value: string;
  @Input() decode: string;
  @Input() isHighlight?: boolean;
  @Input() isDataField?: boolean;

  data: string | any = '';
  type: 'Decode' | 'Hex' = 'Hex';
  isMobile = false;
  isEvmContract = false;
  constructor(
    private environmentService: EnvironmentService,
    private contractService: ContractService,
    private detectRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.isMobile = this.environmentService.isMobile;
    this.data = this.value;
  }

  checkEvmContract(address: string, cb: (isContract: boolean) => void) {
    this.contractService.findEvmContract(address).subscribe({
      next: (res) => {
        if (res?.evm_smart_contract?.length > 0) cb(true);
        else cb(false);
      },
    });
  }

  getAddress (data: any[]) {
    const addresses = [];
    for (const item of data) {
      if(item?.isLink) addresses.push(item?.decode);
    }
    return _.uniq(addresses.filter(Boolean));
  }

  onDecode(field?: string) {
    this.type = 'Decode';
    if (field !== 'data') {
      this.data = this.decode;
      this.checkEvmContract(this.decode, (isContract) => {
        if (isContract) this.isEvmContract = true;
        else this.isEvmContract = false;
        this.detectRef.detectChanges();
      });
      return;
    } else {
      if (Array.isArray(this.decode)) {
        const addresses = this.getAddress(this.decode);       
        this.contractService.findEvmContractList(addresses).subscribe({
          next: (evmList) => {
            this.data = Array.isArray(this.decode) && this.decode?.map((item) => {
              const isEvmContract = !!evmList?.evm_smart_contract?.find(contract => contract?.address === item?.decode?.toString()?.toLowerCase());

              return {
                ...item,
                isEvmContract,
              };
            });
            this.detectRef.detectChanges();
          },
        })
      }
    }
  }

  onHex() {
    this.type = 'Hex';
    this.data = this.value;
    this.isEvmContract = false;
  }
}
