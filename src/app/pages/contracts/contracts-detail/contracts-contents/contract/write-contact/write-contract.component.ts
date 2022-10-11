import { Component, Input, OnInit } from '@angular/core';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { TranslateService } from '@ngx-translate/core';
import { Schema, Validator } from 'jsonschema';
import * as _ from 'lodash';
import { SIGNING_MESSAGE_TYPES } from 'src/app/core/constants/wallet.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { getRef, getType, parseValue } from 'src/app/core/helpers/contract-schema';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { getFee } from 'src/app/core/utils/signing/fee';

@Component({
  selector: 'app-write-contract',
  templateUrl: './write-contract.component.html',
  styleUrls: ['./write-contract.component.scss'],
})
export class WriteContractComponent implements OnInit {
  @Input() contractDetailData: any;

  isExpand = false;
  isConnectedWallet = false;
  walletAddress = '';
  userAddress = '';
  walletAccount: any;

  chainInfo = this.environmentService.configValue.chain_info;

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;

  jsValidator = new Validator();

  isLoadingAction = false;
  urlAction = '';

  root: any[];

  constructor(
    public walletService: WalletService,
    private toastr: NgxToastrService,
    public translate: TranslateService,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.userAddress = wallet.bech32Address;
      } else {
        this.userAddress = null;
      }
    });

    try {
      const jsonWriteContract = JSON.parse(this.contractDetailData?.execute_msg_schema);

      this.jsValidator.addSchema(jsonWriteContract);

      if (this.jsValidator.schemas) {
        this.root = this.makeSchemaInput(this.jsValidator.schemas['/'].oneOf);
      }
    } catch {}

    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.isConnectedWallet = true;
        this.walletAddress = this.walletService.wallet?.bech32Address;
      } else {
        this.isConnectedWallet = false;
      }
    });
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

  connectWallet(): void {
    this.walletAccount = this.walletService.getAccount();
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
      fieldName,
      properties: props,
      fieldList,
    };
  }

  makeSchemaInput(schemas: Schema[]): any[] {
    const result = schemas
      .map((msg) => {
        try {
          const properties = this.getProperties(msg);

          return properties;
        } catch (e) {
          return null;
        }
      })
      .filter((list) => list && list?.fieldName !== 'upload_logo'); // ignore case upload_logo - CW20

    return result;
  }

  handleExecute(msg) {
    this.connectWallet();
    this.clearAllError();
    if (this.walletAccount && msg) {
      const { fieldList, fieldName } = msg;

      const msgExecute = {
        [fieldName]: {},
      };

      fieldList.forEach((item) => {
        const isError = item.isRequired && !item.value;

        if (!isError) {
          item.value &&
            _.assign(msgExecute[fieldName], {
              [item.fieldName]: parseValue(item),
            });
          return;
        }

        _.assign(item, { isError });
        msgExecute[fieldName] = null;
      });

      if (msgExecute[fieldName]) {
        msg.isLoading = true;
        this.execute(msgExecute, msg);
      }
    }
  }

  execute(data, msg) {
    try {
      this.walletService
        .execute(this.userAddress, this.contractDetailData.contract_address, data)
        .then((e) => {
          msg.isLoading = false;
          if((e as any).result?.error) {
            let msgError = ( e as any).result.error.toString() || 'Error';
            this.toastr.error(msgError);
          } else {
            this.toastr.success(this.translate.instant('NOTICE.SUCCESS_TRANSACTION'));
          }
        })
        .catch((error) => {
          msg.isLoading = false;
          if (!error.toString().includes('Request rejected')) {
            let msgError = error.toString() || 'Error';
            this.toastr.error(msgError);
          }
        });
    } catch (error) {
      this.toastr.error(`Error: ${error}`);
    }
  }
  // execute(msg) {
  //   let singer = window.getOfflineSignerOnlyAmino(this.walletService.chainId);
  //   const fee: any = {
  //     amount: [
  //       {
  //         denom: this.coinMinimalDenom,
  //         amount: '1',
  //       },
  //     ],
  //     gas: getFee(SIGNING_MESSAGE_TYPES.WRITE_CONTRACT),
  //   };

  //   SigningCosmWasmClient.connectWithSigner(this.chainInfo.rpc, singer)
  //     .then((client) => {
  //       return client.execute(this.userAddress, this.contractDetailData.contract_address, msg, fee);
  //     })
  //     .then((client) => {
  //       if (client?.transactionHash) {
  //         this.urlAction = 'transaction/' + client?.transactionHash;
  //         this.isLoadingAction = true;
  //         setTimeout(() => {
  //           this.toastr.success(this.translate.instant('NOTICE.SUCCESS_TRANSACTION'));
  //         }, 4000);
  //       }
  //     })
  //     .catch((error) => {
  //       if (!error.toString().includes('Request rejected')) {
  //         let msgError = error.toString() || 'Error';
  //         this.toastr.error(msgError);
  //       }
  //     });
  // }

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
