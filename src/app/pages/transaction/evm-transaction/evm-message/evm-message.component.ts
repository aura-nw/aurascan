import { Component, Input } from '@angular/core';
import { Interface, parseEther } from 'ethers';
import { EMethodContract } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TransactionService } from 'src/app/core/services/transaction.service';

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
    data: string;
  }[];

  inputDataType = {
    RAW: 'Raw',
    DECODED: 'Decoded',
    ORIGINAL: 'Original',
  };
  typeInput = this.inputDataType.RAW;
  inputDataRaw = {};
  inputDataDecoded = {};

  isLog = true;
  method;
  isDecoded = false;
  isContractVerified = false;
  isCreateContract = false;
  arrTopicDecode = [];
  interfaceCoder: Interface;

  constructor(
    private transactionService: TransactionService,
    public env: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.inputDataRaw['methodId'] = this.transaction?.inputData?.substring(0, 8);
    this.inputDataRaw['arrList'] = this.transaction?.inputData?.slice(8).match(/.{1,64}/g);
    if (this.inputDataRaw['methodId'] === EMethodContract.Creation) {
      this.isCreateContract = true;
      this.typeInput = this.inputDataType.ORIGINAL;
    }
    this.getDataDecoded();
    this.getMethodName(this.inputDataRaw['methodId']);
  }

  changeType(data) {
    this.typeInput = data;
  }

  getDataDecoded() {
    if (!this.transaction?.to) {
      return;
    }

    this.transactionService.getAbiContract(this.transaction?.to?.toLowerCase()).subscribe((res) => {
      if (res?.evm_contract_verification?.length > 0 && res.evm_contract_verification[0]?.abi) {
        this.isContractVerified = true;
        this.isDecoded = true;
        this.interfaceCoder = new Interface(res.evm_contract_verification[0].abi);

        const value = parseEther('1.0');
        const rawData = this.interfaceCoder.parseTransaction({ data: '0x' + this.transaction?.inputData, value });
        if (rawData?.fragment?.inputs?.length > 0) {
          this.getListTopicDecode();
          this.inputDataRaw['name'] =
            this.interfaceCoder.getFunction(rawData?.fragment?.name)?.format() || rawData.name;
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

  getListTopicDecode() {
    this.transaction.eventLog.forEach((element, index) => {
      let arrTopicTemp = element?.evm_signature_mapping_topic || [];
      try {
        const arrTemp =
          this.interfaceCoder
            .decodeEventLog(element.topic0, `0x${this.transaction?.inputData}`, element.topics)
            .toArray() || [];
        arrTopicTemp = [...this.arrTopicDecode[index], ...arrTemp];
      } catch (e) {}

      this.arrTopicDecode[index] = arrTopicTemp;
    });
  }

  getMethodName(methodId) {
    this.transactionService.getListMappingName(methodId).subscribe((res) => {
      this.method = res[methodId] || methodId || 'Send';
    });
  }
}
