import { Component, Input } from '@angular/core';
import { Interface, parseEther } from 'ethers';
import _ from 'lodash';
import { EMethodContract } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { mappingMethodName } from 'src/app/global/global';

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
  contractAddressAbi = '';
  topicsDecoded = [];
  abiContractData = [];

  constructor(
    private transactionService: TransactionService,
    public env: EnvironmentService,
    private contractService: ContractService,
  ) {}

  ngOnInit(): void {
    this.inputDataRaw['methodId'] = this.transaction?.inputData?.substring(0, 8);
    this.inputDataRaw['arrList'] = this.transaction?.inputData?.slice(8).match(/.{1,64}/g);
    if (this.inputDataRaw['methodId'] === EMethodContract.Creation) {
      this.isCreateContract = true;
      this.typeInput = this.inputDataType.ORIGINAL;
    }
    this.getMethodName(this.inputDataRaw['methodId']);
    this.getAbiList();
  }

  changeType(data) {
    this.typeInput = data;
  }

  getAbiList() {
    let listContract = this.transaction.eventLog.map((i) => i.address?.toLowerCase());
    listContract = _.uniq(listContract);

    this.transactionService.getListAbiContract(listContract).subscribe((res) => {
      if (res?.evm_contract_verification?.length > 0) {
        this.isContractVerified = true;
        this.isDecoded = true;
        this.abiContractData = res?.evm_contract_verification.map((i) => ({
          contractAddress: i.contract_address,
          abi: i.abi,
          interfaceCoder: new Interface(i.abi),
        }));

        const abiInfo = this.abiContractData.find((f) => f.contractAddress === this.transaction?.to);
        if (abiInfo.abi) {
          const value = parseEther('1.0');
          const rawData = abiInfo.interfaceCoder.parseTransaction({ data: '0x' + this.transaction?.inputData, value });
          if (rawData?.fragment?.inputs?.length > 0) {
            this.getListTopicDecode();

            this.inputDataRaw['name'] =
              abiInfo.interfaceCoder.getFunction(rawData?.fragment?.name)?.format() || rawData.name;
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
      }
    });
  }

  getListTopicDecode() {
    this.transaction.eventLog.forEach((element, index) => {
      let arrTopicTemp = element?.evm_signature_mapping_topic || [];
      try {
        let decoded = [
          {
            index: 0,
            decode: arrTopicTemp?.[0],
            value: element.topics[0],
          },
        ];

        const abiInfo = this.abiContractData.find((f) => f.contractAddress === element.address);
        if (abiInfo.abi) {
          console.log(`0x${element.data || this.transaction?.inputData}`, element.data, this.transaction?.inputData);
          const paramsDecode = abiInfo.interfaceCoder.parseLog({
            topics: element.topics?.filter((f) => f),
            data: `0x${element.data || this.transaction?.inputData}`,
          });

          if (paramsDecode?.fragment?.inputs?.length > 0) {
            const param = paramsDecode?.fragment?.inputs.map((item, idx) => {
              return {
                index: index + 1,
                name: item.name,
                type: item.type,
                isAllowSwitchDecode: true,
                value: element.topics[index + 1],
                decode: paramsDecode.args[index]?.toString(),
              };
            });
            console.log('param-', index, ': ', param);
            decoded = [...decoded, ...param];
          }
        }
        this.topicsDecoded[index] = decoded;
      } catch (e) {
        console.log(e);
      }

      this.arrTopicDecode[index] = arrTopicTemp;
    });
    this.arrTopicDecode = [...this.arrTopicDecode];
  }

  getMethodName(methodId) {
    this.transactionService.getListMappingName(methodId).subscribe((res) => {
      this.method = mappingMethodName(res, methodId);
    });
  }
}
