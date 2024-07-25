import { Component, Input } from '@angular/core';
import { Interface, parseEther } from 'ethers';
import _ from 'lodash';
import { EMethodContract } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { mappingMethodName } from 'src/app/global/global';
import { FeatureFlagService } from '../../../../core/data-services/feature-flag.service';
import { FeatureFlags } from '../../../../core/constants/feature-flags.enum';

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
  interfaceCoder: Interface;
  contractAddressAbi = '';
  contractAddressAbiList = [];
  topicsDecoded = [];
  abiContractData = [];

  constructor(
    private transactionService: TransactionService,
    public env: EnvironmentService,
    private contractService: ContractService,
    private featureFlag: FeatureFlagService,
  ) {}

  ngOnInit(): void {
    if (!this.isEvmContract) {
      this.typeInput = this.inputDataType.DECODED;
      if (!this.transaction?.memo) this.typeInput = this.inputDataType.ORIGINAL;
    } else this.typeInput = this.inputDataType.RAW;

    this.inputDataRaw['methodId'] = this.transaction?.inputData?.substring(0, 8);
    this.inputDataRaw['arrList'] = this.transaction?.inputData?.slice(8).match(/.{1,64}/g);
    if (this.inputDataRaw['methodId'] === EMethodContract.Creation) {
      this.isCreateContract = true;
      this.typeInput = this.inputDataType.ORIGINAL;
    }
    this.getMethodName(this.inputDataRaw['methodId']);
    if (this.featureFlag.isEnabled(FeatureFlags.EnhanceEventLog)) {
      this.getProxyContractAbi();
    } else {
      this.getProxyContractAbiOld(this.transaction?.to);
    }
  }

  changeType(data) {
    this.typeInput = data;
  }

  getProxyContractAbiOld(address) {
    this.contractAddressAbi = this.transaction?.to;
    this.contractService.getProxyContractAbi(address).subscribe({
      next: (res) => {
        this.contractAddressAbi =
          _.get(res, 'evm_smart_contract[0].evm_proxy_histories[0].implementation_contract') || this.contractAddressAbi;
      },
      complete: () => {
        this.getDataDecoded();
      },
    });
  }

  getDataDecoded() {
    if (!this.contractAddressAbi) {
      return;
    }

    this.transactionService.getAbiContract(this.contractAddressAbi?.toLowerCase()).subscribe((res) => {
      if (res?.evm_contract_verification?.length > 0 && res.evm_contract_verification[0]?.abi) {
        this.isContractVerified = true;
        this.isDecoded = true;
        this.interfaceCoder = new Interface(res.evm_contract_verification[0].abi);

        const value = parseEther('1.0');
        const rawData = this.interfaceCoder.parseTransaction({ data: '0x' + this.transaction?.inputData, value });
        if (rawData?.fragment?.inputs?.length > 0) {
          this.getListTopicDecodeOld();
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

          this.inputDataRaw['name'] = abiInfo.interfaceCoder.getFunction(rawData?.selector)?.format() || rawData.name;
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
      }
      this.getListTopicDecode();
    });
  }

  mappingTopics(element) {
    element['isAllowSwitchDecodeDataField'] = false;
    return element?.topics?.map((i, tidx) => ({
      index: tidx,
      decode: '',
      value: i,
      isAllowSwitchDecode: false,
    }));
  }

  mappingFunctionName(item) {
    const { type, indexed, name } = item;
    let param = type;
    if (!indexed) param = `${type} ${name}`;
    else param = `${type} indexed ${name}`;
    return param;
  }

  getListTopicDecodeOld() {
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
    this.arrTopicDecode = [...this.arrTopicDecode];
  }

  getFunctionColor(inputs: any[]) {
    return inputs?.map((i, index) => {
      const { type, indexed, name, components} = i;
      let param = index > 0 ? ' ' : '';

      const nameHTML = name ? `<span style="color: var(--aura-red-3); font-family: inherit">${name}</span>` : '';

      if (type === 'tuple') {
        const tupleHTML = `<span style="color: var(--aura-green-3); font-family: inherit"> (${components?.map(this.mappingFunctionName)?.join(', ')})</span>`
        param = `${tupleHTML} ${nameHTML}`;
        return param;
      }

      const dataTypeHTML = type
        ? `<span style="color: var(--aura-green-3); font-family: inherit">${type}</span>`
        : '';
      const modifierHTML = indexed
        ? `<span style="color: var(--aura-gray-3); font-family: inherit">indexed</span>`
        : '';

      if(type) param += dataTypeHTML;
      if(indexed) param += ` ${modifierHTML}`;
      if(name) param += ` ${nameHTML}`;
      
      return param;
    })
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
          decoded = this.mappingTopics(element);
        } else {
          const paramsDecode = abiInfo.interfaceCoder.parseLog({
            topics: element.topics?.filter((f) => f),
            data: `0x${element.data || this.transaction?.inputData}`,
          });

          if (!paramsDecode) decoded = this.mappingTopics(element);
          else {
            const paramsHTML = this.getFunctionColor(paramsDecode?.fragment?.inputs);
            const decodeTopic0 = `> ${paramsDecode?.fragment?.name}(${paramsHTML})`;
            
            decoded = [
              {
                index: 0,
                decode: decodeTopic0,
                value: element.topics[0],
              },
            ];

            const inputs = paramsDecode?.fragment?.inputs;
            if (inputs?.length > 0) {
              const params = [];
              const data = [];
              let currentParamIndex = 0;

              inputs?.forEach((item, idx) => {
                if (item?.type === 'tuple') {
                  item?.components?.forEach((tupleParam, tidx) => {
                    const tupleDecode = {
                      indexed: tupleParam?.indexed,
                      name: tupleParam?.name,
                      type: tupleParam?.type,
                      isLink: tupleParam?.type === 'address',
                      decode: paramsDecode.args[idx][tidx]?.toString(),
                    }
                    data.push(tupleDecode);
                  });
                  return;        
                } 
                
                const param = {
                  indexed: item?.indexed,
                  name: item.name,
                  type: item.type,
                  isLink: item.type === 'address',
                  decode: paramsDecode.args[idx]?.toString(),
                };
                if (item?.indexed) {
                  param['indexed'] = item.indexed;
                  param['index'] = currentParamIndex + 1;
                  param['isAllowSwitchDecode'] = true;
                  param['value'] = element.topics[currentParamIndex + 1];
                  currentParamIndex += 1;
                  params.push(param);
                } else {
                  data.push(param);
                }
              });

              element.dataDecoded = data;
              decoded = [...decoded, ...params];
            }
          }
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
      if (!this.isEvmContract) this.method = 'Send';
      if (!this.transaction?.to) this.method = 'Create Contract';
    });
  }
}