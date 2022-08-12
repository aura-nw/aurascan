import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { MY_FORMATS } from 'src/app/core/constants/common.constant';
import { CodeTransaction, ModeExecuteTransaction } from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { IContractPopoverData } from 'src/app/core/models/contract.model';

@Component({
  selector: 'app-contract-popover',
  templateUrl: './contract-popover.component.html',
  styleUrls: ['./contract-popover.component.scss'],
})
export class ContractPopoverComponent implements OnInit, OnChanges {
  @Input() popoverData: IContractPopoverData = null;

  FORMAT = MY_FORMATS;

  loading = true;

  codeTransaction = CodeTransaction;
  modeExecuteTransaction = ModeExecuteTransaction;

  image_s3 = this.environmentService.configValue.image_s3;
  defaultLogoToken = this.image_s3 + 'images/icons/token-logo.png';
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;

  constructor(private environmentService: EnvironmentService) {}

  ngOnChanges(): void {
    if (this.popoverData) {
      this.loading = false;
      this.popoverData['from_address_convert'] = this.displayAddress(this.popoverData.from_address);
      this.popoverData['to_address_convert'] = this.displayAddress(this.popoverData.to_address, true);
      this.popoverData['gasPrice'] = Number(this.popoverData?.fee) / Number(this.popoverData?.gas_used);
      this.popoverData['gasPriceU'] = this.popoverData['gasPrice'] * Math.pow(10, 6);
    }
  }

  ngOnInit(): void {}

  displayAddress(address, isToAddress = false) {
    let element = '';
    const firstChar = address.substring(0, 8);
    const lastChar = address.substring(address.length - 8);
    const addressFormat = firstChar + '...' + lastChar;
    if (isToAddress) {
      if (this.popoverData.modeExecute !== this.modeExecuteTransaction.Burn && this.popoverData?.to_address) {
        element =
          `<a class="text--green cursor-pointer" href="/tokens/token/` +
          this.popoverData.tokenAddress +
          '?a=' +
          address +
          `">` +
          addressFormat +
          `</a>`;
      } else if (this.popoverData.modeExecute === this.modeExecuteTransaction.Burn) {
        element = `<span>` + addressFormat + `</span>`;
      } else if (!address) {
        element = `<span>-</span>`;
      }
    } else {
      if (this.popoverData.modeExecute !== this.modeExecuteTransaction.Mint && this.popoverData?.from_address) {
        element =
          `<a class="text--green cursor-pointer" href="/tokens/token/` +
          this.popoverData.tokenAddress +
          '?a=' +
          address +
          `">` +
          addressFormat +
          `</a>`;
      } else if (this.popoverData.modeExecute === this.modeExecuteTransaction.Mint) {
        element = `<span>` + addressFormat + `</span>`;
      } else if (!address) {
        element = `<span>-</span>`;
      }
    }
    return element;
  }
}
