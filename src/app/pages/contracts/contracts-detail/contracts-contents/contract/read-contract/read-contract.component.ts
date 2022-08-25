import { Component, Input, OnInit } from '@angular/core';
import { SigningCosmWasmClient, toBinary } from '@cosmjs/cosmwasm-stargate';
import { WalletService } from 'src/app/core/services/wallet.service';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { Schema, Validator } from 'jsonschema';
import * as _ from 'lodash';
@Component({
  selector: 'app-read-contract',
  templateUrl: './read-contract.component.html',
  styleUrls: ['./read-contract.component.scss'],
})
export class ReadContractComponent implements OnInit {
  @Input() contractDetailData: any;

  isExpand = false;
  // jsonReadContract: any;
  // dataResponse = null;
  // errorInput = false;
  // isLoading = false;
  // currentFrom = null;
  // objQuery = [];

  chainInfo = this.environmentService.configValue.chain_info;

  jsValidator = new Validator();

  root: any[];

  constructor(public walletService: WalletService, private environmentService: EnvironmentService) {}

  ngOnInit(): void {
    try {
      const jsonReadContract = JSON.parse(this.contractDetailData?.query_msg_schema);

      if (jsonReadContract) {
        this.jsValidator.addSchema(jsonReadContract);

        if (this.jsValidator.schemas) {
          this.root = this.makeSchemaInput(this.jsValidator.schemas['/'].oneOf);

          console.log('Debug', { root: this.root, schema: this.jsValidator.schemas });
        }
      }
    } catch {}
    //auto execute query without params
    // this.handleQueryContract();
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

  reloadData() {
    // for (let i = 0; i < document.getElementsByClassName('form-check-input').length; i++) {
    //   (<HTMLInputElement>document.getElementsByClassName('form-check-input')[i]).value = '';
    // }
    this.expandMenu(true);
    this.root?.forEach((msg) => {
      this.resetError(msg, true);
      msg.dataResponse = '';
    });
    this.isExpand = false;

    // this.dataResponse = null;
    // this.errorInput = false;
  }

  query(query, msg) {
    msg.isLoading = true;
    SigningCosmWasmClient.connect(this.chainInfo.rpc)
      .then((client) => client.queryContractSmart(this.contractDetailData.contract_address, query))
      .then((config) => {
        if (config) {
          // this.dataResponse = config;
          msg.dataResponse = config;
        }
        msg.isLoading = false;
      })
      .catch((err) => {
        msg.dataResponse = 'No Data';
        msg.isLoading = false;
      });
  }

  handleQueryContract(query): void {
    if (query) {
      const { fieldList, fieldName } = query;

      const msgQuery = {
        [fieldName]: {},
      };

      fieldList.forEach((item) => {
        const isError = item.isRequired && !item.value;

        if (!isError) {
          item.value &&
            _.assign(msgQuery[fieldName], {
              [item.fieldName]: this.parseValue(item),
            });
          return;
        }

        _.assign(item, { isError });
        msgQuery[fieldName] = null;
      });

      if (msgQuery[fieldName]) {
        console.log(msgQuery);

        this.query(msgQuery, query);
      }
    }
  }

  getRef(ref: string) {
    if (ref) {
      const schema = this.jsValidator.schemas;
      if (schema && schema[`/${ref}`]) {
        return schema[`/${ref}`];
      }
    }

    return null;
  }

  getRefType(ref: string): string | string[] {
    if (ref) {
      const schema = this.jsValidator.schemas;

      if (schema && schema[`/${ref}`]) {
        const _ref = schema[`/${ref}`];
        const type = _ref.type;
        if (type === 'object') {
        }
        return schema[`/${ref}`].type;
      }
    }

    return 'any';
  }

  getType(schema) {
    const { $ref: ref, type: _type } = schema;
    const isBinary = ref === '#/definitions/Binary';

    const type = ref ? this.getRefType(ref) : _type;

    return {
      type: type || 'any',
      isBinary,
    };
  }

  getProperties(schema: Schema) {
    const fieldName = _.first(Object.keys(schema.properties));

    const { $ref: ref } = schema.properties[fieldName];

    let props = ref ? this.getRef(ref) : schema.properties[fieldName];

    const childProps = props?.properties;

    let fieldList = [];

    if (childProps) {
      // console.log({ [fieldName]: childProps });

      fieldList = Object.keys(childProps).map((e) => ({
        fieldName: e,
        isRequired: (props.required as string[])?.includes(e),
        ...this.getType(childProps[e]),
      }));
    }

    return {
      resType: schema.type,
      fieldName,
      properties: props,
      fieldList,
    };
  }

  makeSchemaInput(schemas: Schema[]): any[] {
    const result = schemas.map((msg) => {
      try {
        const properties = this.getProperties(msg);
        if (properties.fieldList && !properties.fieldList.length) {
          this.handleQueryContract(properties);
        }

        return properties;
      } catch (e) {
        return {};
      }
    });

    return result;
  }

  parseValue(item) {
    let value;
    if (item.type === 'any') {
      try {
        value = JSON.parse(item.value);
      } catch (e) {
        value = item.value;
      }
    } else if (item.isBinary) {
      value = toBinary(item.value);
    } else {
      value = item.value;
    }
    return value;
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

  /*
    querySmartContract(name: string, currentFrom: number) {
    this.currentFrom = currentFrom;
    let queryData = {};
    this.dataResponse = null;
    let err = {};
    let objReadContract = {};
    const contractTemp = this.jsonReadContract?.oneOf.find((contract) => contract.required[0] === name);

    //Check has required property, else execute query without params
    if (contractTemp.properties[name].hasOwnProperty('properties')) {
      Object.entries(contractTemp.properties[name].properties).forEach(([contract, value]) => {
        let element: HTMLInputElement = document.getElementsByClassName(
          'form-check-input ' + name + ' ' + contract,
        )[0] as HTMLInputElement;

        //check input null && require field
        if (element?.value?.length === 0 && element?.classList.contains('input-require')) {
          err[contract.toString()] = true;
          this.errorInput = true;
          return;
        }

        let type = contractTemp.properties[name].properties[contract].type;
        //check exit value
        if (element?.value) {
          objReadContract[contract] = element?.value;
        }

        //convert number if integer field
        if (type === 'integer' || (type[0] === 'integer' && element?.value)) {
          objReadContract[contract] = Number(element?.value);
        }
      });

      contractTemp.properties[name].checkErr = err;
      if (Object.keys(contractTemp.properties[name]?.checkErr).length > 0) {
        return;
      }
    }

    this.isLoading = true;
    queryData = {
      [name]: objReadContract,
    };
    this.executeQuery(queryData);
  }

  resetCheck() {
    this.errorInput = false;
  }
  async executeQuery(queryData, saveResponse = false) {
    const client = await SigningCosmWasmClient.connect(this.chainInfo.rpc);
    try {
      const config = await client.queryContractSmart(this.contractDetailData.contract_address, queryData);
      if (saveResponse) {
        let element = {};
        element = config;
        this.objQuery[Object.keys(queryData)[0]] = config;
        return;
      }
      if (config) {
        this.dataResponse = config;
      }
    } catch (error) {
      this.dataResponse = 'No Data';
    }
    this.isLoading = false;
  }

  objectKeys(obj) {
    return obj ? Object.keys(obj) : [];
  }

  */
}
