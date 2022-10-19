import { Component, Input, OnInit } from '@angular/core';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { Schema, Validator } from 'jsonschema';
import * as _ from 'lodash';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { getRef, getType, parseValue } from 'src/app/core/helpers/contract-schema';
import { WalletService } from 'src/app/core/services/wallet.service';
@Component({
  selector: 'app-read-contract',
  templateUrl: './read-contract.component.html',
  styleUrls: ['./read-contract.component.scss'],
})
export class ReadContractComponent implements OnInit {
  @Input() contractDetailData: any;

  isExpand = false;

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
        }
      }
    } catch {}
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
    this.expandMenu(true);
    this.clearAllError(true);
    this.isExpand = false;
  }

  clearAllError(all = false) {
    this.root?.forEach((msg) => {
      this.resetError(msg, all);
      if (msg.fieldList && msg.fieldList.length && all) msg.dataResponse = '';
    });
  }

  query(query, msg) {
    msg.isLoading = true;
    SigningCosmWasmClient.connect(this.chainInfo.rpc)
      .then((client) => client.queryContractSmart(this.contractDetailData.contract_address, query))
      .then((config) => {
        if (config) {
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
    this.clearAllError();
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
              [item.fieldName]: parseValue(item),
            });
          return;
        }

        _.assign(item, { isError });
        msgQuery[fieldName] = null;
      });

      if (msgQuery[fieldName]) {
        this.query(msgQuery, query);
      }
    }
  }

  getProperties(schema: Schema) {
    const fieldName = _.first(Object.keys(schema.properties));

    const { $ref: ref } = schema.properties[fieldName];

    let props = ref ? getRef(this.jsValidator.schemas, ref) : schema.properties[fieldName];

    const childProps = props?.properties;

    let fieldList = [];

    if (childProps) {
      fieldList = Object.keys(childProps).map((e) => ({
        fieldName: e,
        isRequired: (props.required as string[])?.includes(e),
        ...getType(this.jsValidator.schemas, childProps[e]),
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
    return schemas
      .map((msg) => {
        try {
          const properties = this.getProperties(msg);
          if (properties.fieldList && !properties.fieldList.length) {
            this.handleQueryContract(properties);
          }

          return properties;
        } catch (e) {
          return null;
        }
      })
      .filter((list) => list && list?.fieldName !== 'download_logo'); // ignore case download_logo - CW20
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
}
