import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { balanceOf } from 'src/app/core/utils/common/parsing';
import { DATEFORMAT } from '../../../../core/constants/common.constant';
import { PROPOSAL_VOTE } from '../../../../core/constants/proposal.constant';
import { TYPE_TRANSACTION } from '../../../../core/constants/transaction.constant';
import { pipeTypeData, TRANSACTION_TYPE_ENUM, TypeTransaction } from '../../../../core/constants/transaction.enum';
import { ValidatorService } from '../../../../core/services/validator.service';
import { getAmount, Globals } from '../../../../global/global';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-transaction-messages',
  templateUrl: './transaction-messages.component.html',
  styleUrls: ['./transaction-messages.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TransactionMessagesComponent implements OnInit {
  @Input() transactionDetail: any;

  typeTransaction = TYPE_TRANSACTION;
  voteConstant = PROPOSAL_VOTE;
  transactionDetailType: TypeTransaction;
  eTransType = TRANSACTION_TYPE_ENUM;
  amount = 0;
  amountClaim = 0;
  amountCommission = 0;
  commissionAutoClaim = 0;
  storeCodeId = 0;
  dateVesting: string;
  validatorName = '';
  validatorNameDes = '';
  listValidator: any[];
  listAmountClaim = [];
  objMsgContract: any;
  ibcData: any;
  typeGetData = {
    Transfer: 'transfer',
    WithdrawRewards: 'withdraw_rewards',
    WithdrawCommission: 'withdraw_commission',
    StoreCode: 'store_code',
    SendPacket: 'send_packet',
  };
  pipeTypeData = pipeTypeData;

  listIBCProgress = [
    {
      tx: '0EE4B7440D69CB4D81304278492B4962896FB96E8414D5923698A2E49A909551',
      time: '2022-09-01T06:53:17.687Z',
      type: '/ibc.applications.transfer.v1.MsgTransfer',
    },
    {
      tx: 'C51F7C868FDFC7600459CE76BBB1369E22FF4F2DDF9B4BC92FC11E5E42065871',
      time: '2022-09-01T06:53:17.687Z',
      type: '/ibc.core.channel.v1.MsgRecvPacket',
    },
    {
      tx: 'CBCFCD0274AD95DCB4DD09E15016688F4898D7B1249B3CBACEA0206270B5DADB',
      time: '2022-09-01T06:53:17.687Z',
      type: '/ibc.core.channel.v1.MsgRecvPacket',
    },
    {
      tx: 'B35862D6F7E7344D7E514AC3CC41843EDACB6DCE4511FDDEBBEC75B27BFACD45',
      time: '2022-09-01T06:53:17.687Z',
      type: '/ibc.core.channel.v1.MsgRecvPacket',
    },
    {
      tx: '0AEF20E04837B8D22D7C11923A52D9EB9ABBCA4BC4E228473479F75280009146',
      time: '2022-09-01T06:53:17.687Z',
      type: '/ibc.core.channel.v1.MsgAcknowledgement',
    },
  ];

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  constructor(
    public global: Globals,
    private datePipe: DatePipe,
    private validatorService: ValidatorService,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
    public commonService: CommonService
  ) {}

  ngOnInit(): void {
    if (this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.Vesting) {
      let date = new Date(Number(this.transactionDetail?.messages[0]?.end_time) * 1000);
      this.dateVesting = this.datePipe.transform(date, DATEFORMAT.DATETIME_UTC);
    }
    if (
      this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.Delegate ||
      this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.GetReward ||
      this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.Redelegate ||
      this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.Undelegate ||
      this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.CreateValidator
    ) {
      this.getListValidator();
      this.checkGetReward();
    } else if (this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.StoreCode) {
      this.checkStoreCode();
    } else if (
      this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.InstantiateContract ||
      this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.ExecuteContract
    ) {
      this.displayMsgRaw();
    } else if (
      //get data if type = IBC
      this.transactionDetail?.type.toLowerCase().indexOf('ibc') > -1
    ) {
      this.getDataIBC();
    }

    //get amount of transaction
    this.amount = getAmount(
      this.transactionDetail?.messages,
      this.transactionDetail?.type,
      this.transactionDetail?.raw_log,
      this.coinMinimalDenom,
    );
    const typeTrans = this.typeTransaction.find(
      (f) => f.label.toLowerCase() === this.transactionDetail?.type.toLowerCase(),
    );
    this.transactionDetailType = typeTrans?.value;
  }

  getListValidator(): void {
    this.validatorService.validators().subscribe(
      (res) => {
        if (res.data?.length > 0) {
          this.listValidator = res.data;
          if (this.transactionDetail) {
            const { type, messages } = this.transactionDetail;

            if (type === TRANSACTION_TYPE_ENUM.Redelegate) {
              const validatorSrcAddress = this.listValidator.find(
                (f) => f.operator_address === messages[0]?.validator_src_address,
              );
              this.validatorName = validatorSrcAddress?.title || '';

              const validatorDstAddress = this.listValidator.find(
                (f) => f.operator_address === messages[0]?.validator_dst_address,
              );
              this.validatorNameDes = validatorDstAddress?.title || '';
            } else {
              this.validatorName =
                this.listValidator.find((f) => f.operator_address === messages[0]?.validator_address)?.title || '';
            }

            if (messages?.length > 1) {
              messages.forEach((message) => {
                message.validatorName =
                  this.listValidator.find((f) => f.operator_address === message?.validator_address)?.title || '';
              });
            }
          }
        }
      },
      (_) => {},
    );
  }

  checkGetReward(): void {
    try {
      const jsonData = JSON.parse(this.transactionDetail?.raw_log);
      if (jsonData && jsonData[0]) {
        jsonData.forEach((j) => {
          let rawType = this.typeGetData.Transfer;
          if (this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.GetReward) {
            rawType = this.typeGetData.WithdrawRewards;
          }
          const temp = j?.events.filter((f) => f.type === rawType);
          const tempCommission = j?.events.filter((f) => f.type === this.typeGetData.WithdrawCommission);
          if (temp?.length > 0) {
            const data = temp[0]?.attributes;
            if (data) {
              if (this.transactionDetail?.type !== TRANSACTION_TYPE_ENUM.GetReward) {
                if (this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.Redelegate) {
                  let arrayAmount = data.filter((k) => k.key === 'amount');
                  this.amountClaim = 0;
                  arrayAmount.forEach((element) => {
                    this.amountClaim += balanceOf(Number(element.value?.replace(this.coinMinimalDenom, ''))) || 0;
                  });
                } else {
                  let amount = data.find((k) => k.key === 'amount')?.value;
                  let recipient = data.find((k) => k.key === 'recipient')?.value || '';
                  if (recipient === this.transactionDetail?.messages[0]?.delegator_address) {
                    this.amountClaim = balanceOf(amount?.replace(this.coinMinimalDenom, '')) || 0;
                  }
                }
              }
              this.transactionDetail?.messages.forEach((message) => {
                const validator = data.find((trans) => trans.key === 'validator')?.value;
                if (validator === message.validator_address && 'delegator_address' in message) {
                  let amount = data.find((k) => k.key === 'amount')?.value?.replace(this.coinMinimalDenom, '');
                  amount = balanceOf(amount) || 0;
                  this.listAmountClaim.push(amount);
                }
              });
            }
          }

          if (tempCommission?.length > 0) {
            const tempAmountCommission = tempCommission[0]?.attributes[0]?.value;
            const tempAmountReward = jsonData[0]?.events?.filter((f) => f.type === rawType);
            this.amountCommission =
              balanceOf(tempAmountReward[0]?.attributes[0]?.value?.replace(this.coinMinimalDenom, '')) || 0;
            this.commissionAutoClaim = balanceOf(tempAmountCommission?.replace(this.coinMinimalDenom, '')) || 0;
          }
        });
      }
    } catch (e) {}
  }

  displayMsgRaw(): void {
    const obj = this.transactionDetail?.tx?.tx?.body?.messages[0];
    this.objMsgContract = Object.keys(obj).reduce((newObj, key) => {
      if (key === 'msg' || key === 'funds') {
        newObj[key] = obj[key];
      }
      return newObj;
    }, {});
  }

  checkStoreCode(): void {
    try {
      const jsonData = JSON.parse(this.transactionDetail?.raw_log);
      if (jsonData && jsonData[0]) {
        const temp = jsonData[0]?.events.filter((f) => f.type === this.typeGetData.StoreCode);
        if (temp) {
          this.storeCodeId = temp[0]?.attributes[0]?.value || 0;
        }
      }
    } catch (e) {}
  }

  getDataIBC(): void {
    try {
      const jsonData = JSON.parse(this.transactionDetail?.raw_log);
      if (jsonData && jsonData[0]) {
        const temp = jsonData[0]?.events.filter((f) => f.type === this.typeGetData.SendPacket);
        if (temp) {
          this.ibcData = temp[0]?.attributes;
          this.ibcData = {
            ...this.ibcData,
            packet_sequence: this.ibcData.find((f) => f.key === 'packet_sequence').value,
            packet_src_port: this.ibcData.find((f) => f.key === 'packet_src_port').value,
            packet_dst_port: this.ibcData.find((f) => f.key === 'packet_dst_port').value,
            packet_src_channel: this.ibcData.find((f) => f.key === 'packet_src_channel').value,
            packet_dst_channel: this.ibcData.find((f) => f.key === 'packet_dst_channel').value,
            effected: this.ibcData.find((f) => f.key === 'success') ? '1' : '0',
          };
          this.ibcData['time_out'] = this.transactionDetail?.tx?.tx?.body?.messages.find(
            (k) => k['@type'] === TRANSACTION_TYPE_ENUM.IBCTimeout,
          );
          this.ibcData['update_client'] = this.transactionDetail?.tx?.tx?.body?.messages.find(
            (k) => k['@type'] === TRANSACTION_TYPE_ENUM.IBCUpdateClient,
          );
          if (this.ibcData['time_out']) {
            this.ibcData['time_out']['data'] = {
              amount: this.ibcData.find((f) => f.key === 'receiver').value,
              denom: this.ibcData.find((f) => f.key === 'refund_denom').value,
              receiver: this.ibcData.find((f) => f.key === 'refund_denom').value,
              sender: this.ibcData.find((f) => f.key === 'sender').value,
            };
          }
        }
      }
    } catch (e) {}
  }

  parsingOptionVote(option) {
    const statusObj = this.voteConstant.find((s) => s.key === option);
    if (statusObj !== undefined) {
      return statusObj.value;
    }
    return null;
  }

  getRewardLength(arr): number {
    let count = 0;
    arr.forEach((element) => {
      if (element.hasOwnProperty('delegator_address')) count++;
    });
    return count;
  }

  filterIBCType(type){
    let arr = [];
    arr = this.listIBCProgress.filter((f) => f.type === type);
    return arr
  }
}
