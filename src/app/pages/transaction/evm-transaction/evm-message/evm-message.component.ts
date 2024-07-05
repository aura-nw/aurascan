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
  @Input() isEvmContract: boolean;
  @Input() eventLog: {
    id: number;
    contractName?: string;
    contract?: string;
    topics?: {
      address: string;
      data: string;
    }[];
    data: string;
    dataDecoded?: string;
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
  contractAddressAbiList = [];
  topicsDecoded = [];
  abiContractData = [];

  constructor(
    private transactionService: TransactionService,
    public env: EnvironmentService,
    private contractService: ContractService
  ) {}

  ngOnInit(): void {
    if(!this.isEvmContract){
      this.typeInput = this.inputDataType.DECODED;
      if(!this.transaction?.memo) this.typeInput = this.inputDataType.ORIGINAL;
    } else this.typeInput = this.inputDataType.RAW;

    this.inputDataRaw['methodId'] = this.transaction?.inputData?.substring(0, 8);
    this.inputDataRaw['arrList'] = this.transaction?.inputData?.slice(8).match(/.{1,64}/g);
    if (this.inputDataRaw['methodId'] === EMethodContract.Creation) {
      this.isCreateContract = true;
      this.typeInput = this.inputDataType.ORIGINAL;
    }
    this.getMethodName(this.inputDataRaw['methodId']);
    this.getProxyContractAbi();
  }

  changeType(data) {
    this.typeInput = data;
  }

  getProxyContractAbi() {
    let listContract = this.transaction.eventLog.map((i) => i.address?.toLowerCase());
    listContract.push(this.transaction?.to?.toLowerCase());
    listContract = _.uniq(listContract);
    this.contractService.getListProxyAbi(listContract?.filter(Boolean)).subscribe({
      next: (res) => {
        this.contractAddressAbiList = res?.evm_smart_contract?.map((item) => {
          return {
            implementation_contract: _.get(item, 'evm_proxy_histories[0].implementation_contract') || item?.address,
            address: item?.address,
          };
        });
      },
      complete: () => {
        this.getAbiList();
      },
    });
  }

  getAbiList() {
    if (this.contractAddressAbiList.length === 0) {
      return;
    }
    const implementationContractList = this.contractAddressAbiList.map((i) => i.implementation_contract);
    
    this.transactionService.getListAbiContract(implementationContractList).subscribe((res) => {
      
      if (res?.evm_contract_verification?.length > 0) {
        this.isDecoded = true;
        this.abiContractData = res?.evm_contract_verification.map((i) => ({
          contractAddress: this.contractAddressAbiList.find((f) => f.implementation_contract === i.contract_address)
            ?.address,
          implementationContractAddr: i.contract_address,
          abi: i.abi,
          interfaceCoder: new Interface(i.abi),
        }));

        const abiInfo = this.abiContractData.find((f) => f.contractAddress === this.transaction?.to);
        
        if (abiInfo) {
          this.isContractVerified = true;
          const value = parseEther('1.0');
          const rawData = abiInfo.interfaceCoder.parseTransaction({ data: '0x' + this.transaction?.inputData, value });
          this.inputDataRaw['name'] =
          abiInfo.interfaceCoder.getFunction(rawData?.fragment?.name)?.format() || rawData.name;
          this.inputDataDecoded['name'] = rawData.name;
          
          if (rawData?.fragment?.inputs?.length > 0) {
            this.inputDataDecoded['params'] = rawData?.fragment?.inputs.map((item, index) => {
              return {
                name: item.name,
                type: item.type,
                value: rawData.args[index],
              };
            });
          }
        }
        this.getListTopicDecode();
      }
    });
  }

  mappingTopics(element){
    element['isAllowSwitchDecodeDataField'] = false;
    return element?.topics?.map((i, tidx) => ({
      index: tidx,
      decode: '',
      value: i,
      isAllowSwitchDecode: false,
    }));
  }

  getListTopicDecode() {
    this.transaction.eventLog.forEach((element, index) => {
      
      let arrTopicTemp = element?.evm_signature_mapping_topic || [];
      try {
        const abiInfo = this.abiContractData.find((f) => f.contractAddress === element.address);
        let decoded = [];
        element.data = element?.data?.replace('\\x', '');
        element['isAllowSwitchDecodeDataField'] = true;

        if (!abiInfo?.abi) {
          decoded = this.mappingTopics(element)
        } else {
          const paramsDecode = abiInfo.interfaceCoder.parseLog({
            topics: element.topics?.filter((f) => f),
            data: `0x${element.data || this.transaction?.inputData}`,
          });

          if(!paramsDecode) decoded = this.mappingTopics(element)
          else {
            const params = paramsDecode?.fragment?.inputs.map((i) => `${i.type} ${i.indexed ? 'indexed' : ''} ${i.name}`);
            const decodeTopic0 = `> ${paramsDecode?.fragment?.name}(${params.join(', ')})`;
  
            decoded = [
              {
                index: 0,
                decode: decodeTopic0,
                value: element.topics[0],
              },
            ];
            
            const inputs = paramsDecode?.fragment?.inputs
            if (inputs?.length > 0) {
              const params = [];
              const data = [];
              let currentParamIndex = 0;
              
              inputs?.forEach((item, idx) => {              
                const param = {
                  indexed: item?.indexed,
                  name: item.name,
                  type: item.type,
                  isLink: item.type === 'address',
                  decode: paramsDecode.args[idx]?.toString(),
                }
                if(item?.indexed) {
                  param["indexed"] = item.indexed;
                  param["index"] = currentParamIndex + 1;
                  param["isAllowSwitchDecode"] = true;
                  param["value"] = element.topics[currentParamIndex + 1],
                  currentParamIndex += 1;
                  params.push(param);
                }else {
                  data.push(param);
                }
              });
              
              element.dataDecoded = data;
              decoded = [...decoded, ...params];
            }}
        }
        this.topicsDecoded[index] = decoded;
      } catch (e) {}
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
