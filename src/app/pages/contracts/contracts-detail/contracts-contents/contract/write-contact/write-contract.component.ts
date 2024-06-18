import { Component, Input, OnInit } from '@angular/core';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogConfig as MatDialogConfig,
} from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { Schema, Validator } from 'jsonschema';
import * as _ from 'lodash';
import { MESSAGES_CODE_CONTRACT } from 'src/app/core/constants/messages.constant';
import { getRef, getType, parseValue } from 'src/app/core/helpers/contract-schema';
import { IMultichainWalletAccount } from 'src/app/core/models/wallet';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { parseError } from 'src/app/core/utils/cosmoskit/helpers/errors';
import { PopupAddZeroComponent } from 'src/app/shared/components/popup-add-zero/popup-add-zero.component';

@Component({
  selector: 'app-write-contract',
  templateUrl: './write-contract.component.html',
  styleUrls: ['./write-contract.component.scss'],
})
export class WriteContractComponent implements OnInit {
  @Input() contractDetailData: any;

  isExpand = false;
  userAddress = '';
  walletAccount: IMultichainWalletAccount;

  jsValidator = new Validator();
  root: any[];

  constructor(
    private walletService: WalletService,
    private toastr: NgxToastrService,
    private translate: TranslateService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.walletService.walletAccount$.subscribe((wallet) => {
      if (wallet) {
        this.userAddress = wallet.address;
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
        isAddButtonZero: e === 'amount', // button add zero for amount field
        fieldName: e,
        isRequired: (props.required as string[])?.includes(e),
        ...getType(this.jsValidator.schemas, childProps[e]),
      }));

      // add fund for all item write contract
      fieldList.push({ fieldName: 'fund', isRequired: false, type: 'json' });
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
    let msgError = MESSAGES_CODE_CONTRACT[5].Message;
    msgError = msgError ? msgError.charAt(0).toUpperCase() + msgError.slice(1) : 'Error';

    this.walletService
      .executeContract(this.userAddress, this.contractDetailData.address, data)
      .then((result) => {
        msg.isLoading = false;

        if (result?.transactionHash) {
          this.toastr.loading(result.transactionHash);
          setTimeout(() => {
            this.toastr.success(this.translate.instant('NOTICE.SUCCESS_TRANSACTION'));
          }, 4000);
        }
      })
      .catch((error) => {
        msg.isLoading = false;

        const _error = parseError(error);
        if (_error?.code !== undefined) {
          msgError = error.toString().includes('out of gas') ? 'out of gas' : msgError;
          this.toastr.error(error.toString().substring(0, 200) + '...' || msgError);
        }
      });
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

  showAddZero(msg) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'grant-overlay-panel';
    dialogConfig.data = {};
    let dialogRef = this.dialog.open(PopupAddZeroComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        result = result === 'custom' ? 0 : result;
        let amount = msg['fieldList']?.find((k) => k.fieldName === 'amount')?.value || '';
        //check amount is exit
        const numPow = amount.toString()
          ? Math.pow(10, result)?.toString().substring(1)
          : Math.pow(10, result)?.toString();
        amount = amount?.toString() + numPow;
        msg['fieldList'].find((k) => k.fieldName === 'amount').value = amount.toString();
      }
    });
  }

  disconnect() {
    this.walletService.disconnect();
  }
}
