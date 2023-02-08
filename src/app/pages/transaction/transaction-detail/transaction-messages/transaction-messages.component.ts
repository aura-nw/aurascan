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
import { TransactionService } from 'src/app/core/services/transaction.service';
import * as _ from 'lodash';
import { formatWithSchema } from '../../../../core/helpers/date';
import { ProposalService } from 'src/app/core/services/proposal.service';

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
  ibcOrigin: any;

  ibcListMapping = {
    Receive: 'recv_packet',
    Transfer: 'send_packet',
    Ack: 'acknowledge_packet',
    TimeOut: 'timeout_packet',
  };
  numberListSend = 5;
  dataTimeOut = {};
  spendLimitAmount = 0;
  typeGrantAllowance = 'Basic';

  listIBCProgress = [];

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  constructor(
    public global: Globals,
    private datePipe: DatePipe,
    private validatorService: ValidatorService,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
    public commonService: CommonService,
    private transactionService: TransactionService,
    private proposalService: ProposalService,
  ) {}

  ngOnInit(): void {
    if (this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.Vesting) {
      let date = new Date(Number(this.transactionDetail?.messages[0]?.end_time) * 1000);
      this.dateVesting = this.datePipe.transform(date, DATEFORMAT.DATETIME_UTC);
    } else if (this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.PeriodicVestingAccount) {
      let date = new Date(Number(this.transactionDetail?.messages[0]?.start_time) * 1000);
      this.dateVesting = this.datePipe.transform(date, DATEFORMAT.DATETIME_UTC);
    } else if (
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
    } else if (this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.MsgGrantAllowance) {
      let type;
      if (this.transactionDetail?.messages[0]?.allowance?.allowance?.allowance) {
        type = _.get(this.transactionDetail?.messages[0]?.allowance, "allowance.allowance.['@type']");
      } else if (this.transactionDetail?.messages[0]?.allowance?.allowance) {
        type = _.get(this.transactionDetail?.messages[0]?.allowance, "allowance.['@type']");
      } else {
        type = _.get(this.transactionDetail?.messages[0]?.allowance, "['@type']");
      }
      if (type.indexOf('Periodic') > 0) {
        this.typeGrantAllowance = 'Periodic';
      }

      this.spendLimitAmount =
        _.get(this.transactionDetail?.messages[0]?.allowance, 'basic.spend_limit[0].amount') ||
        _.get(this.transactionDetail?.messages[0]?.allowance, 'allowance.basic.spend_limit[0].amount') ||
        _.get(this.transactionDetail?.messages[0]?.allowance, 'allowance.allowance.basic.spend_limit[0].amount');
      if (this.typeGrantAllowance === 'Basic') {
        this.spendLimitAmount =
          _.get(this.transactionDetail?.messages[0]?.allowance, 'spend_limit[0].amount') ||
          _.get(this.transactionDetail?.messages[0]?.allowance, 'allowance.spend_limit[0].amount') ||
          _.get(this.transactionDetail?.messages[0]?.allowance, 'allowance.allowance.spend_limit[0].amount');
      }
    } else if (
      //get data if type = IBC
      this.transactionDetail?.type.toLowerCase().indexOf('ibc') > -1
    ) {
      this.getDataIBC();
      setTimeout(() => {
        this.getListIBCSequence(this.ibcData?.packet_sequence);
      }, 2000);
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
    this.objMsgContract = _.get(this.transactionDetail.tx.tx.body, 'messages').map((element) => {
      const msg = _.get(element, 'msg');
      const funds = _.get(element, 'funds');
      return { msg, funds };
    });

    //get first data if array = 1
    if (this.objMsgContract.length === 1) {
      this.objMsgContract = this.objMsgContract[0];
    }
  }

  checkStoreCode(): void {
    try {
      const jsonData = JSON.parse(this.transactionDetail?.raw_log);
      if (jsonData && jsonData[0]) {
        const temp = jsonData[0]?.events.filter((f) => f.type === this.typeGetData.StoreCode);
        if (temp) {
          this.storeCodeId = temp[0]?.attributes.find((k) => k.key === 'code_id')?.value || 0;
        }
      }
    } catch (e) {}
  }

  getDataIBC(type = '', index = 0): void {
    try {
      const jsonData = JSON.parse(this.transactionDetail?.raw_log);
      if (type && jsonData.length > 0) {
        jsonData.forEach((k) => {
          this.ibcOrigin = k.events.find((f) => f.type === type)?.attributes;
          if (k.events.type === type) {
            this.ibcData = k.events.type;
          }
        });
        if (this.ibcOrigin) {
          this.ibcData = {
            ...this.ibcOrigin,
            packet_sequence: this.ibcOrigin.find((f) => f.key === 'packet_sequence').value,
            packet_src_port: this.ibcOrigin.find((f) => f.key === 'packet_src_port').value,
            packet_dst_port: this.ibcOrigin.find((f) => f.key === 'packet_dst_port').value,
            packet_src_channel: this.ibcOrigin.find((f) => f.key === 'packet_src_channel').value,
            packet_dst_channel: this.ibcOrigin.find((f) => f.key === 'packet_dst_channel').value,
            effected: this.transactionDetail?.raw_log.toLowerCase().indexOf('success') > -1 ? '1' : '0',
            typeProgress: this.eTransType.IBCTransfer,
          };

          if (type === this.ibcListMapping.Receive) {
            let dataReceive = this.ibcOrigin?.find((f) => f.key === 'packet_data')?.value;
            try {
              dataReceive = JSON.parse(dataReceive);
            } catch (e) {
              dataReceive = dataReceive;
            }
            this.ibcData = {
              ...this.ibcData,
              amount: dataReceive?.amount,
              receiver: dataReceive?.receiver,
              sender: dataReceive?.sender,
              denom: dataReceive?.denom,
            };
          }

          this.ibcData['time_out'] = this.transactionDetail?.tx?.tx?.body?.messages.filter(
            (k) => k['@type'] === TRANSACTION_TYPE_ENUM.IBCTimeout,
          );

          this.ibcData['update_client'] = this.transactionDetail?.tx?.tx?.body?.messages.find(
            (k) => k['@type'] === TRANSACTION_TYPE_ENUM.IBCUpdateClient,
          );
          this.ibcData['acknowledgement'] = this.transactionDetail?.tx?.tx?.body?.messages.find(
            (k) => k['@type'] === TRANSACTION_TYPE_ENUM.IBCAcknowledgement,
          );
          this.ibcData['receive'] = this.transactionDetail?.tx?.tx?.body?.messages.find(
            (k) => k['@type'] === TRANSACTION_TYPE_ENUM.IBCReceived,
          );

          if (this.ibcData['time_out']?.length > 0) {
            this.ibcData['time_out'].forEach((element, index) => {
              let timeout = jsonData[index + 1]?.events?.find((f) => f.type === 'timeout')?.attributes;
              let transfer = jsonData[index + 1]?.events?.find((f) => f.type === 'transfer')?.attributes;
              element['data'] = {
                root: {
                  amount: timeout?.find((f) => f.key === 'refund_amount')?.value,
                  denom: timeout?.find((f) => f.key === 'refund_denom')?.value,
                  receiver: timeout?.find((f) => f.key === 'refund_receiver')?.value,
                  sender: transfer?.find((f) => f.key === 'sender')?.value,
                },
              };
            });
          }

          if (this.ibcData['acknowledgement']) {
            try {
              let dataEncode = atob(this.ibcData['acknowledgement']?.packet?.data);
              const data = JSON.parse(dataEncode);
              this.ibcData['acknowledgement'] = {
                ...this.ibcData['acknowledgement'],
                amount: data.amount,
                denom: data.denom,
                receiver: data.receiver,
                sender: data.sender,
              };
            } catch (e) {}
          }

          if (this.ibcData['receive']) {
            let data;
            this.transactionDetail.tx.logs.forEach((element) => {
              data = element.events.find((k) => k['type'] === this.typeGetData.Transfer);
            });
            let temp = data?.attributes.find((j) => j['key'] === 'amount')?.value;
            this.ibcData['receive']['denom'] = this.commonService.mappingNameIBC(temp)?.display || '';
            this.ibcData['typeProgress'] = this.eTransType.IBCReceived;
          }
        }
      }
    } catch (e) {}
  }

  getListIBCSequence(sequence): void {
    if (!sequence) {
      return;
    }
    this.transactionService.getListIBCSequence(sequence).subscribe((res) => {
      const { code, data } = res;
      if (code === 200) {
        let typeTx;
        this.listIBCProgress = [];
        let txs = _.get(data, 'transactions').map((element) => {
          const code = _.get(element, 'tx_response.code');
          const tx_hash = _.get(element, 'tx_response.txhash');
          const time = _.get(element, 'tx_response.timestamp');
          const effected = _.get(element, 'indexes.fungible_token_packet_success')?.length > 0 ? 1 : 0;

          typeTx = _.get(element, 'tx_response.tx.body.messages[0].@type');
          const lstType = _.get(element, 'tx_response.tx.body.messages');
          if (lstType?.length > 0) {
            lstType.forEach((type) => {
              if (type['@type'] !== TRANSACTION_TYPE_ENUM.IBCUpdateClient) {
                typeTx = type['@type'];
                return;
              }
            });
          }

          let temp = _.get(element, 'tx_response.tx.auth_info.fee.amount[0].denom') || this.coinMinimalDenom;
          const denom = temp === this.coinMinimalDenom ? this.denom : temp;
          return { code, tx_hash, typeTx, denom, time, effected };
        });
        if (this.ibcData['typeProgress'] === this.eTransType.IBCReceived) {
          txs = txs.filter((k) => k.typeTx === this.eTransType.IBCReceived);
        } else {
          txs = txs.filter((k) => k.typeTx !== this.eTransType.IBCReceived);
        }
        this.listIBCProgress = txs;
      }
    });
  }

  parsingOptionVote(option) {
    const optionVote = this.proposalService.getVoteMessageByConstant(option);
    const statusObj = this.voteConstant.find((s) => s.key === optionVote);
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

  filterIBCType(type) {
    let arr = [];
    arr = this.listIBCProgress.filter((f) => f.typeTx === type);
    arr.forEach((k) => {
      k.denom = k.denom === this.denom ? this.denom : k?.denom;
    });
    return arr;
  }

  displayTitle(type) {
    const typeTrans = this.typeTransaction?.find((f) => f.label.toLowerCase() === type.toLowerCase());
    return typeTrans?.value;
  }

  loadMoreSend() {
    this.numberListSend += 5;
  }

  getDataJson(key) {
    try {
      const jsonData = JSON.parse(this.transactionDetail?.raw_log);
      const result =
        jsonData[0]?.events.find((f) => f.type === 'instantiate')?.attributes?.find((f) => f.key === key)?.value || '';
      return result;
    } catch (e) {}
  }

  getDateValue(time) {
    try {
      if (time) {
        if (time?.seconds) {
          time = new Date(time.seconds * 1000).toISOString();
        }
        return formatWithSchema(new Date(time).getTime(), DATEFORMAT.DATETIME_UTC);
      } else {
        return '-';
      }
    } catch {
      return '-';
    }
  }
}
