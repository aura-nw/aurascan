import { Component, Input } from '@angular/core';
import { AbiCoder, Interface, parseEther } from 'ethers';
import { EMethodContract } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { toHexData } from 'src/app/core/utils/common/parsing';
let abiCoder: AbiCoder;
@Component({
  selector: 'app-evm-message',
  templateUrl: './evm-message.component.html',
  styleUrls: ['./evm-message.component.scss'],
})
export class EvmMessageComponent {
  @Input() title: string;
  @Input() transaction: any;
  @Input() eventLog: {
    id: number;
    contractName?: string;
    contract?: string;
    topics?: {
      address: string;
      data: string;
    }[];
    data?: {
      value: string;
      hexValue: string;
    };
  }[];

  inputDataType = {
    RAW: 'Raw',
    DECODED: 'Decoded',
    ORIGINAL: 'Original',
  };
  typeInput = this.inputDataType.RAW;
  inputDataRaw = {};
  inputDataDecoded = {};

  showAll = false;
  method;
  isDecoded = false;
  isContractVerified = false;
  isCreateContract = false;

  constructor(
    private transactionService: TransactionService,
    public env: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.inputDataRaw['methodId'] = this.transaction?.inputData?.substring(0, 8);
    this.inputDataRaw['arrList'] = this.transaction?.inputData?.slice(8).match(/.{1,64}/g);
    this.method = this.inputDataRaw['methodId'] || 'Transfer';
    if (this.method === EMethodContract.Creation) {
      this.isCreateContract = true;
      this.typeInput = this.inputDataType.ORIGINAL;
    }
    this.getDataDecoded();
  }

  changeType(data) {
    this.typeInput = data;
  }

  getDataDecoded() {
    this.transactionService.getAbiContract(this.transaction?.to?.toLowerCase()).subscribe((res) => {
      if (res?.evm_contract_verification?.length > 0 && res.evm_contract_verification[0]?.abi) {
        this.isContractVerified = true;
        this.isDecoded = true;
        const interfaceCoder = new Interface(res.evm_contract_verification[0].abi);
        const value = parseEther('1.0');
        const rawData = interfaceCoder.parseTransaction({ data: '0x' + this.transaction?.inputData, value })
        if (rawData?.fragment?.inputs?.length > 0) {
          this.method = rawData?.fragment?.name;
          this.inputDataDecoded['name'] = rawData.name;
          this.inputDataDecoded['params'] = rawData?.fragment?.inputs.map((item, index) => {
            return {
              name: item.name,
              type: item.type,
              value: rawData.args[index],
            };
          });
        }
      }
    });
  }
}
