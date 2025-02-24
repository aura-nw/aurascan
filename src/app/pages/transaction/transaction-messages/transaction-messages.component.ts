import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';
import * as Long from 'long';
import { DATEFORMAT } from 'src/app/core/constants/common.constant';
import { PROPOSAL_VOTE } from 'src/app/core/constants/proposal.constant';
import { TYPE_TRANSACTION } from 'src/app/core/constants/transaction.constant';
import {
  CodeTransaction,
  pipeTypeData,
  TRANSACTION_TYPE_ENUM,
  TypeTransaction,
} from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { formatWithSchema } from 'src/app/core/helpers/date';
import { CommonService } from 'src/app/core/services/common.service';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { ProposalService } from 'src/app/core/services/proposal.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { balanceOf } from 'src/app/core/utils/common/parsing';

@Component({
  selector: 'app-transaction-messages',
  templateUrl: './transaction-messages.component.html',
  styleUrls: ['./transaction-messages.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TransactionMessagesComponent implements OnInit {
  @Input() transactionDetail: any;
  @Input() listValidator: any;

  typeTransaction = TYPE_TRANSACTION;
  voteConstant = PROPOSAL_VOTE;
  transactionDetailType: TypeTransaction;
  eTransType = TRANSACTION_TYPE_ENUM;
  amountClaim = 0;
  amountCommission = 0;
  commissionAutoClaim = 0;
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
  spendLimitAmount = 0;
  denomIBC = '';
  seeLessArr = [false];
  totalAmountExecute = 0;
  listIBCProgress = [];
  isTransactionTypeDefault = true;

  currentData = [];
  specialCase = {
    ByteCode: 'ByteCode',
    MultiSend: 'MultiSend',
    EventLog: 'EventLog',
  };
  typeGrant = {
    Basic: 'Basic',
    Periodic: 'Periodic',
  };
  typeGrantAllowance = this.typeGrant.Basic;
  currentIndex = 0;
  transactionTypeArr = [];
  codeTransaction = CodeTransaction;
  isDisplay = [];
  keyIbc = 'client_message';

  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  coinMinimalDenom = this.environmentService.chainInfo.currencies[0].coinMinimalDenom;

  constructor(
    private datePipe: DatePipe,
    public environmentService: EnvironmentService,
    public commonService: CommonService,
    private transactionService: TransactionService,
    private proposalService: ProposalService,
    private nameTagService: NameTagService,
  ) {}

  ngOnInit(): void {
    console.log(this.transactionDetail);
    if (this.transactionDetail?.type?.toLowerCase().indexOf('ibc') == -1) {
      this.checkTypeMessage();
    }

    // set key ibc update client when old type
    if (this.transactionDetail?.messages[0]?.header) {
      this.keyIbc = 'header';
    }

    this.currentIndex = 0;
    // check if contract type not belongTo TypeTransaction enum
    if (Object.values(TRANSACTION_TYPE_ENUM).includes(this.transactionDetail?.type)) {
      this.isTransactionTypeDefault = false;
    }

    if (
      this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.Redelegate ||
      this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.CreateValidator ||
      this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.ExecuteAuthz
    ) {
      this.checkGetReward();
    } else if (
      //get data if type = IBC
      this.transactionDetail?.type.toLowerCase().indexOf('ibc') > -1
    ) {
      this.getDataIBC();
      setTimeout(() => {
        this.getListIBCSequence(this.ibcData?.packet_sequence);
      }, 1000);
    }

    const typeTrans = this.typeTransaction.find(
      (f) => f.label.toLowerCase() === this.transactionDetail?.type.toLowerCase(),
    );
    this.transactionDetailType = typeTrans?.value;
  }

  displayTitleTX() {
    return this.transactionDetail?.type.split('.').pop();
  }

  checkTypeMessage() {
    this.transactionDetail?.messages.forEach((data, index) => {
      if (this.currentIndex !== index) {
        return;
      }
      let result = [];
      let date = null;

      const typeTrans = this.typeTransaction.find((f) => f.label.toLowerCase() === data['@type'].toLowerCase());
      this.transactionTypeArr.push((typeTrans?.value || data['@type'].split('.').pop())?.replace('Msg', ''));
      const denom = data?.amount?.length > 0 ? data?.amount[0]?.denom : this.denom;
      let dataDenom = this.commonService.mappingNameIBC(denom);
      switch (data['@type']) {
        case this.eTransType.Send:
          result.push({
            key: 'From Address',
            value: this.nameTagService.findNameTagByAddress(data?.from_address),
            link: { url: '/address', data: data?.from_address, nameTag: true },
          });
          result.push({
            key: 'To Address',
            value: this.nameTagService.findNameTagByAddress(data?.to_address),
            link: { url: '/address', data: data?.to_address, nameTag: true },
          });
          result.push({
            key: 'Amount',
            value: data?.amount[0]?.amount,
            denom: dataDenom,
            pipeType: pipeTypeData.BalanceOf,
          });
          break;

        case this.eTransType.MultiSend:
          result.push({ value: data.wasm_byte_code, specialCase: this.specialCase.MultiSend });
          break;

        case this.eTransType.Delegate:
        case this.eTransType.Undelegate:
        case this.eTransType.GetReward:
          this.checkGetReward();
          result.push({
            key: 'Delegator Address',
            value: this.nameTagService.findNameTagByAddress(data?.delegator_address),
            link: { url: '/address', data: data?.delegator_address, nameTag: true },
          });
          result.push({
            key: 'Validator Address',
            value: `${data?.validator_address} (${this.getNameValidator(data?.validator_address)})`,
            link: { url: '/validators', data: data?.validator_address, nameTag: true },
          });
          // get amount
          let amount = data.amount?.amount;
          let pipeType = pipeTypeData.BalanceOf;
          if (data['@type'] === this.eTransType.GetReward) {
            amount = this.listAmountClaim[index];
            pipeType = pipeTypeData.Number;
          }
          result.push({
            key: 'Amount',
            value: amount || '-',
            denom: dataDenom,
            pipeType: pipeType,
          });

          // check present Auto Claim Reward
          if (
            data['@type'] !== this.eTransType.GetReward &&
            this.listAmountClaim?.length > 0 &&
            this.listAmountClaim[index] > 0
          ) {
            result.push({
              key: 'Auto Claim Reward',
              value: this.listAmountClaim[index],
              denom: dataDenom,
              pipeType: pipeTypeData.Number,
            });
          }
          break;

        case this.eTransType.Redelegate:
          result.push({
            key: 'Delegator Address',
            value: this.nameTagService.findNameTagByAddress(data?.delegator_address),
            link: { url: '/address', data: data?.delegator_address, nameTag: true },
          });
          result.push({
            key: 'Source Validator Address',
            value: `${data?.validator_src_address} (${this.getNameValidator(data?.validator_src_address)})`,
            link: { url: '/validators', data: data?.validator_src_address, nameTag: true },
          });
          result.push({
            key: 'Destination Validator Address',
            value: `${data?.validator_dst_address} (${this.getNameValidator(data?.validator_dst_address)})`,
            link: { url: '/validators', data: data?.validator_dst_address, nameTag: true },
          });
          result.push({
            key: 'Amount',
            value: data.amount?.amount,
            denom: dataDenom,
            pipeType: pipeTypeData.BalanceOf,
          });
          if (this.amountClaim > 0) {
            result.push({
              key: 'Auto Claim Reward',
              value: this.amountClaim,
              denom: dataDenom,
              pipeType: pipeTypeData.Number,
            });
          }
          break;

        case this.eTransType.GrantAuthz:
          result.push({
            key: 'Granter',
            value: this.nameTagService.findNameTagByAddress(data?.granter),
            link: { url: '/address', data: data?.granter, nameTag: true },
          });
          result.push({
            key: 'Grantee',
            value: this.nameTagService.findNameTagByAddress(data?.grantee),
            link: { url: '/address', data: data?.grantee, nameTag: true },
          });
          result.push({ key: 'Authorization Type', value: data?.grant?.authorization?.authorization_type });
          result.push({ key: 'Expiration', value: this.getDateValue(data?.grant?.expiration) || '-' });
          result.push({
            key: 'Limit',
            value: data?.grant?.authorization?.max_tokens?.amount,
            denom: dataDenom,
            pipeType: pipeTypeData.BalanceOf,
          });
          break;

        case this.eTransType.ExecuteAuthz:
          result.push({
            key: 'Grantee',
            value: this.nameTagService.findNameTagByAddress(data?.grantee),
            link: { url: '/address', data: data?.grantee, nameTag: true },
          });
          result.push({ key: 'Authorization Type', value: data?.msgs[0]['@type'] });
          result.push({
            key: 'Total Amount Execute',
            value: this.totalAmountExecute,
            denom: dataDenom,
            pipeType: pipeTypeData.BalanceOf,
          });
          result.push({ key: 'Json', value: data?.msgs, pipeType: pipeTypeData.Json });
          break;

        case this.eTransType.RevokeAuthz:
          result.push({
            key: 'Granter',
            value: this.nameTagService.findNameTagByAddress(data?.granter),
            link: { url: '/address', data: data?.granter, nameTag: true },
          });
          result.push({
            key: 'Grantee',
            value: this.nameTagService.findNameTagByAddress(data?.grantee),
            link: { url: '/address', data: data?.grantee, nameTag: true },
          });
          result.push({ key: 'Message Type Url', value: data.msg_type_url });
          break;

        case this.eTransType.ExecuteContract:
          this.displayMsgRaw(index);
          result.push({
            key: 'Contract',
            value: this.nameTagService.findNameTagByAddress(data?.contract),
            link: { url: '/contracts', data: data?.contract, nameTag: true },
          });
          result.push({
            key: 'Sender',
            value: this.nameTagService.findNameTagByAddress(data?.sender),
            link: { url: '/address', data: data?.sender, nameTag: true },
          });
          result.push({ key: 'Messages', value: this.objMsgContract, pipeType: pipeTypeData.Json });
          break;

        case this.eTransType.InstantiateContract:
        case this.eTransType.InstantiateContract2:
          this.displayMsgRaw(index);
          result.push({
            key: 'Contract',
            value: this.nameTagService.findNameTagByAddress(this.getDataJson('_contract_address')),
            link: { url: '/contracts', data: this.getDataJson('_contract_address'), nameTag: true },
          });
          result.push({
            key: 'Sender',
            value: this.nameTagService.findNameTagByAddress(data?.sender),
            link: { url: '/address', data: data?.sender, nameTag: true },
          });
          result.push({ key: 'Messages', value: this.objMsgContract, pipeType: pipeTypeData.Json });
          break;

        case this.eTransType.StoreCode:
          result.push({
            key: 'Sender',
            value: this.nameTagService.findNameTagByAddress(data?.sender || data?.validator_address),
            link: { url: '/address', data: data?.sender || data?.validator_address, nameTag: true },
          });
          result.push({ key: 'Code Id', value: this.getStoreCode(index), link: { url: '/code-ids/detail' } });
          result.push({ value: data?.wasm_byte_code, specialCase: this.specialCase.ByteCode });
          break;

        case this.eTransType.Vote:
        case this.eTransType.VoteV2:
          result.push({ key: 'Proposal Id', value: this.getLongValue(data.proposal_id), link: { url: '/votings' } });
          result.push({
            key: 'Voter',
            value: this.nameTagService.findNameTagByAddress(data.voter),
            link: { url: '/address', data: data.voter, nameTag: true },
          });
          result.push({ key: 'Option', value: this.parsingOptionVote(data?.option) });
          break;

        case this.eTransType.PeriodicVestingAccount:
          date = new Date(Number(this.transactionDetail?.messages[0]?.start_time) * 1000);
          result.push({
            key: 'From Address',
            value: this.nameTagService.findNameTagByAddress(data.from_address),
            link: { url: '/address', data: data.from_address, nameTag: true },
          });
          result.push({
            key: 'To Address',
            value: this.nameTagService.findNameTagByAddress(data.to_address),
            link: { url: '/address', data: data.to_address, nameTag: true },
          });
          result.push({ key: 'Start Time', value: this.datePipe.transform(date, DATEFORMAT.DATETIME_UTC) });
          result.push({ key: 'Vesting Periods', value: data.vesting_periods, pipeType: pipeTypeData.Json });
          break;

        case this.eTransType.Vesting:
          date = new Date(Number(this.transactionDetail?.messages[0]?.end_time) * 1000);
          result.push({
            key: 'From Address',
            value: this.nameTagService.findNameTagByAddress(data.from_address),
            link: { url: '/address', data: data.from_address, nameTag: true },
          });
          result.push({
            key: 'To Address',
            value: this.nameTagService.findNameTagByAddress(data.to_address),
            link: { url: '/address', data: data.to_address, nameTag: true },
          });
          result.push({ key: 'Vesting Schedule', value: this.datePipe.transform(date, DATEFORMAT.DATETIME_UTC) });
          break;

        case this.eTransType.EditValidator:
          result.push({ key: 'Validator Address', value: data.validator_address, link: { url: '/validators' } });
          result.push({ key: 'Details', value: data.description?.details });
          result.push({ key: 'Moniker', value: data.description?.moniker });
          result.push({
            key: 'Website',
            value: data.description?.website,
            link: { url: data.description?.website, target: true },
          });
          result.push({ key: 'Security Contact', value: data.description?.security_contact });
          result.push({ key: 'Identity', value: data.description?.identity });
          result.push({
            key: 'Commission Rate',
            value: this.checkRateFloatNumber(data?.commission_rate) || '-',
            pipeType: pipeTypeData.Percent,
          });
          result.push({
            key: 'Min Self Delegation',
            value: data.min_self_delegation,
            denom: dataDenom,
            pipeType: pipeTypeData.BalanceOf,
          });
          break;

        case this.eTransType.CreateValidator:
          result.push({
            key: 'Min Self Delegation',
            value: data.min_self_delegation,
            denom: dataDenom,
            pipeType: pipeTypeData.BalanceOf,
          });
          result.push({
            key: 'Delegator Address',
            value: this.nameTagService.findNameTagByAddress(data.delegator_address),
            link: { url: '/address', data: data.delegator_address, nameTag: true },
          });
          result.push({ key: 'Validator Address', value: data.validator_address, link: { url: '/validators' } });
          result.push({
            key: 'Amount',
            value: data.value?.amount,
            denom: dataDenom,
            pipeType: pipeTypeData.BalanceOf,
          });
          result.push({ key: 'Details', value: data.description?.details });
          result.push({ key: 'Moniker', value: data.description?.moniker });
          result.push({
            key: 'Website',
            value: data.description?.website || '-',
            link: { url: data.description?.website },
          });
          result.push({ key: 'Identity', value: data.description?.identity });
          result.push({
            key: 'Commission Rate',
            value: this.checkRateFloatNumber(+data?.commission?.rate) || '-',
            pipeType: pipeTypeData.Percent,
          });
          result.push({
            key: 'Commission Max Rate',
            value: this.checkRateFloatNumber(+data?.commission?.max_rate) || '-',
            pipeType: pipeTypeData.Percent,
          });
          result.push({
            key: 'Commission Max Change Rate',
            value: this.checkRateFloatNumber(+data?.commission?.max_change_rate) || '-',
            pipeType: pipeTypeData.Percent,
          });
          result.push({ key: 'Public Key', value: data?.pubkey?.value || data?.pubkey?.key });
          break;

        case this.eTransType.Unjail:
          result.push({
            key: 'Validator Address',
            value: this.transactionDetail?.tx?.tx?.body?.messages[0]?.validator_addr,
            link: { url: '/validators' },
          });
          break;

        case this.eTransType.SubmitProposalTx:
        case this.eTransType.SubmitProposalTxV2:
          result.push({
            key: 'Amount',
            value: data.initial_deposit[0]?.amount,
            pipeType: pipeTypeData.BalanceOf,
            denom: dataDenom,
          });
          result.push({
            key: 'Proposer',
            value: this.nameTagService.findNameTagByAddress(data.proposer),
            link: { url: '/address', data: data.proposer, nameTag: true },
          });
          if (this.transactionDetail?.tx?.logs?.length > 0) {
            const proposalData = this.transactionDetail?.tx?.logs[0]?.events?.find((k) => k.type === 'submit_proposal')
              ?.attributes;
            result.push({
              key: 'Proposal Id',
              value: this.getLongValue(proposalData?.find((k) => k.key === 'proposal_id')?.value),
              link: { url: '/votings' },
            });
            const proposalType = data.content?.length > 0 ? data.content[0] : data.content || data.messages[0];
            result.push({
              key: 'Proposal Type',
              value: proposalType ? proposalType['@type']?.split('.').pop() : '',
            });
          }
          result.push({ key: 'Title', value: data.content?.title || data?.title });
          break;

        case this.eTransType.MsgGrantAllowance:
          let type;
          const dataAllowance = _.get(this.transactionDetail, 'messages[0].allowance');
          if (dataAllowance?.allowance?.allowance) {
            type = _.get(dataAllowance, "allowance.allowance.['@type']");
          } else if (dataAllowance?.allowance) {
            type = _.get(dataAllowance, "allowance.['@type']");
          } else {
            type = _.get(dataAllowance, "['@type']");
          }
          if (type.indexOf(this.typeGrant.Periodic) > 0) {
            this.typeGrantAllowance = this.typeGrant.Periodic;
          }
          this.spendLimitAmount =
            _.get(dataAllowance, 'basic.spend_limit[0].amount') ||
            _.get(dataAllowance, 'allowance.basic.spend_limit[0].amount') ||
            _.get(dataAllowance, 'allowance.allowance.basic.spend_limit[0].amount');
          if (this.typeGrantAllowance === this.typeGrant.Basic) {
            this.spendLimitAmount =
              _.get(dataAllowance, 'spend_limit[0].amount') ||
              _.get(dataAllowance, 'allowance.spend_limit[0].amount') ||
              _.get(dataAllowance, 'allowance.allowance.spend_limit[0].amount');
          }

          result.push({
            key: 'Granter',
            value: this.nameTagService.findNameTagByAddress(data.granter),
            link: { url: '/address', data: data.granter, nameTag: true },
          });
          result.push({
            key: 'Grantee',
            value: this.nameTagService.findNameTagByAddress(data.grantee),
            link: { url: '/address', data: data.grantee, nameTag: true },
          });
          result.push({ key: 'Type', value: this.typeGrantAllowance });
          result.push({
            key: 'Spend Limit',
            value: this.spendLimitAmount,
            pipeType: pipeTypeData.BalanceOf,
            denom: dataDenom,
          });
          result.push({
            key: 'Expiration',
            value:
              this.getDateValue(
                data?.allowance?.basic?.expiration ||
                  data?.allowance?.expiration ||
                  data?.allowance?.allowance?.allowance?.expiration ||
                  data?.allowance?.allowance?.expiration ||
                  data?.allowance?.allowance?.allowance?.basic?.expiration ||
                  data?.allowance?.allowance?.basic?.expiration,
              ) || '-',
          });
          if (this.typeGrantAllowance === this.typeGrant.Periodic) {
            result.push({
              key: 'Period Spend Limit',
              value:
                data?.allowance?.allowance?.allowance?.period_spend_limit[0]?.amount ||
                data?.allowance?.allowance?.period_spend_limit[0]?.amount ||
                data?.allowance?.period_spend_limit[0].amount ||
                0,
              pipeType: pipeTypeData.BalanceOf,
              denom: dataDenom,
            });
            result.push({
              key: 'Period',
              value:
                data?.allowance?.period?.seconds ||
                data?.allowance?.allowance?.period?.seconds ||
                data?.allowance?.allowance?.allowance?.period?.seconds ||
                data?.allowance?.period ||
                data?.allowance?.allowance?.period ||
                data?.allowance?.allowance?.allowance?.period,
            });
          }
          break;

        case this.eTransType.MsgRevokeAllowance:
          result.push({
            key: 'Granter',
            value: this.nameTagService.findNameTagByAddress(data.granter),
            link: { url: '/address', data: data.granter, nameTag: true },
          });
          result.push({
            key: 'Grantee',
            value: this.nameTagService.findNameTagByAddress(data.grantee),
            link: { url: '/address', data: data.grantee, nameTag: true },
          });
          break;

        case this.eTransType.Deposit:
        case this.eTransType.DepositV2:
          result.push({ key: 'Proposal Id', value: this.getLongValue(data.proposal_id), link: { url: '/votings' } });
          result.push({
            key: 'Depositor',
            value: this.nameTagService.findNameTagByAddress(data.depositor),
            link: { url: '/address', data: data.depositor, nameTag: true },
          });
          result.push({
            key: 'Amount',
            value: data?.amount[0]?.amount,
            denom: dataDenom,
            pipeType: pipeTypeData.BalanceOf,
          });
          break;

        case this.eTransType.MsgMigrateContract:
          result.push({
            key: 'Sender',
            value: this.nameTagService.findNameTagByAddress(data.sender),
            link: { url: '/address', data: data.sender, nameTag: true },
          });
          result.push({ key: 'Contract', value: data.contract, link: { url: '/contracts' } });
          result.push({ key: 'Code ID', value: data.code_id, link: { url: '/code-ids/detail' } });
          break;

        case this.eTransType.ModifyWithdrawAddress:
          result.push({
            key: 'Delegator Address',
            value: this.nameTagService.findNameTagByAddress(data.delegator_address),
            link: { url: '/address', data: data.delegator_address, nameTag: true },
          });
          result.push({
            key: 'Withdraw Address',
            value: this.nameTagService.findNameTagByAddress(data.withdraw_address),
            link: { url: '/address', data: data.withdraw_address, nameTag: true },
          });
          break;

        case this.eTransType.GetRewardCommission:
          result.push({
            key: 'Validator Address',
            value: `${data?.validator_address} (${this.getNameValidator(data?.validator_address)})`,
            link: { url: '/validators', data: data?.validator_address },
          });

          if (this.commissionAutoClaim > 0) {
            result.push({
              key: 'Amount',
              value: this.commissionAutoClaim,
              denom: dataDenom,
              pipeType: pipeTypeData.Number,
            });
          }

          if (this.transactionDetail?.messages[0]['@type'] === this.eTransType.GetReward) {
            result.push({
              key: 'header',
              value: 'Get Commission',
            });
          }
          break;

        default:
          break;
      }

      if (this.transactionDetail.code === CodeTransaction.Success) {
        result.push({
          key: 'Event Log',
          value: this.transactionDetail?.tx?.logs,
          specialCase: this.specialCase.EventLog,
        });
      }

      this.currentData.push(result);
      this.currentIndex++;
    });
  }

  getNameValidator(address) {
    const validatorSrcAddress = this.listValidator?.find((f) => f.operator_address === address);
    return validatorSrcAddress?.description?.moniker || '';
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
          const arrClaim = this.transactionDetail?.tx?.events?.filter(
            (k) => k.type === this.typeGetData.WithdrawRewards,
          );
          const temp = j?.events.filter((f) => f.type === rawType);
          const tempCommission = j?.events.filter((f) => f.type === this.typeGetData.WithdrawCommission);
          if (temp?.length > 0) {
            const data = temp[0]?.attributes;
            if (data) {
              if (this.transactionDetail?.type !== TRANSACTION_TYPE_ENUM.GetReward) {
                if (this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.Redelegate) {
                  if (arrClaim?.length > 0) {
                    arrClaim.forEach((element) => {
                      const amount = element.attributes?.find((k) => k.key === 'amount')?.value;
                      this.amountClaim += balanceOf(Number(amount?.replace(this.coinMinimalDenom, ''))) || 0;
                    });
                  }
                }
              }

              if (this.transactionDetail?.messages[0]?.msgs?.length > 1) {
                this.transactionDetail?.messages[0]?.msgs.forEach((element) => {
                  this.totalAmountExecute += +element?.amount?.amount || 0;
                });
              } else {
                if (
                  this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.Undelegate ||
                  this.transactionDetail?.type === TRANSACTION_TYPE_ENUM.Delegate
                ) {
                  if (arrClaim?.length > 0) {
                    const amount =
                      balanceOf(
                        arrClaim[0]?.attributes
                          .find((data) => data.key === 'amount')
                          ?.value?.replace(this.coinMinimalDenom, ''),
                      ) || 0;
                    this.listAmountClaim.push(amount);
                  }
                } else {
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

  displayMsgRaw(idx = 0): void {
    let msgs = _.get(
      this.transactionDetail?.tx?.tx?.body || this.transactionDetail?.tx?.body || this.transactionDetail,
      'messages',
    );
    msgs?.forEach((element, index) => {
      if (idx === index) {
        let msg = _.get(element, 'msg');
        try {
          if (typeof msg !== 'object' && msg !== null) {
            msg = JSON.parse(msg);
          }
        } catch {}

        //get type mint don't type token id
        if (!msg && this.transactionDetail?.raw_log.indexOf('mint') >= 0) {
          try {
            const jsonData = JSON.parse(this.transactionDetail?.raw_log);
            if (jsonData && jsonData[0]) {
              const data = jsonData[0]?.events[jsonData[0]?.events?.length - 1]?.attributes;
              let tokenId = data.find((k) => k.key === 'token_id')?.value || null;
              msg = { mint: { token_id: tokenId || null } };
            }
          } catch (e) {
            msg = { mint: { token_id: null } };
          }
        }
        const funds = _.get(element, 'funds');
        let result = { msg, funds };
        this.objMsgContract = result;
        return;
      }
    });

    //get first data if array = 1
    if (this.objMsgContract?.length === 1) {
      this.objMsgContract = this.objMsgContract[0];
    }
  }

  getStoreCode(index) {
    try {
      let temp = this.transactionDetail?.tx?.logs[index]?.events[1];
      return temp?.attributes?.find((k) => k.key === 'code_id')?.value || 0;
    } catch (error) {}
  }

  getDataIBC(type = ''): void {
    try {
      const jsonData = JSON.parse(this.transactionDetail?.raw_log);
      if (type && jsonData.length > 0) {
        jsonData.forEach((k) => {
          this.ibcOrigin = k.events?.find((f) => f.type === type)?.attributes;
          this.ibcData = k.events?.find((k) => k.type === type);
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
            let data;
            try {
              let dataEncode = atob(this.ibcData['acknowledgement']?.packet?.data);
              data = JSON.parse(dataEncode);
            } catch (e) {
              data = this.ibcData['acknowledgement']?.packet?.data;
            }
            this.ibcData['acknowledgement'] = {
              ...this.ibcData['acknowledgement'],
              amount: data.amount,
              denom: data.denom,
              receiver: data.receiver,
              sender: data.sender,
            };
          }

          if (this.ibcData['receive']) {
            let data;
            this.transactionDetail.tx.logs.forEach((element) => {
              data = element.events.find((k) => k['type'] === this.typeGetData.Transfer);
            });
            let result = data?.attributes.find((j) => j['key'] === 'amount')?.value;
            if (!result.startsWith('ibc')) {
              result = result?.replace(result?.match(/\d+/g)[0], '');
            }
            this.ibcData['receive']['denomOrigin'] = result;
            this.ibcData['receive']['denom'] = this.commonService.mappingNameIBC(result)['display'] || '';
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
    this.transactionService.getListIBCSequence(sequence, this.ibcData?.packet_src_channel).subscribe((res) => {
      if (res?.transaction?.length > 0) {
        let typeTx;
        this.listIBCProgress = [];
        let txs = _.get(res, 'transaction').map((element) => {
          const code = _.get(element, 'data.tx_response.code');
          const tx_hash = _.get(element, 'data.tx_response.txhash');
          const time = _.get(element, 'data.tx_response.timestamp');
          const effected = _.get(element, 'indexes.fungible_token_packet_success')?.length > 0 ? 1 : 0;

          typeTx = _.get(element, 'data.tx.body.messages[0].@type');
          const lstType = _.get(element, 'data.tx.body.messages');
          if (lstType?.length > 0) {
            lstType.forEach((type) => {
              if (type['@type'] !== TRANSACTION_TYPE_ENUM.IBCUpdateClient) {
                typeTx = type['@type'];
                return;
              }
            });
          }

          let temp = _.get(element, 'data.tx.auth_info.fee.amount[0].denom') || this.coinMinimalDenom;
          const denom = temp === this.coinMinimalDenom ? this.denom : temp;
          return { code, tx_hash, typeTx, denom, time, effected };
        });
        let denomTemp;
        if (this.ibcData['typeProgress'] === this.eTransType.IBCReceived) {
          txs = txs.filter((k) => k.typeTx === this.eTransType.IBCReceived);
          denomTemp = res.transaction[0]?.event_attributes[0]?.value;
        } else {
          txs = txs.filter((k) => k.typeTx !== this.eTransType.IBCReceived);
          denomTemp = this.transactionDetail?.tx?.tx?.body?.messages[0]?.token?.denom;
        }
        this.listIBCProgress = txs;
        if (denomTemp) {
          const dataDenom = this.commonService.mappingNameIBC(denomTemp);
          this.denomIBC = dataDenom['symbol'] || denomTemp;
          if (this.denomIBC === this.coinMinimalDenom) {
            this.denomIBC = this.denom;
          }
        }
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

  filterIBCType(type) {
    let arr = [];
    arr = this.listIBCProgress?.filter((f) => f.typeTx === type);
    arr?.forEach((k) => {
      k.denom = k.denom === this.denom ? this.denom : k?.denom;
    });
    return arr;
  }

  displayTitle(type) {
    const typeTrans = this.typeTransaction?.find((f) => f.label.toLowerCase() === type.toLowerCase());
    return typeTrans?.value;
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

  checkRateFloatNumber(value) {
    if (!!value) {
      const temp = +value / Math.pow(10, 18);
      let tempPercent = temp * 100;
      //check is int value
      if (Number(tempPercent) === tempPercent) {
        value = temp;
      }
      return value;
    }
    return '-';
  }

  getLongValue(value) {
    if (value) {
      const longProposalId = Long.fromValue(value);
      if (Long.isLong(longProposalId)) {
        value = longProposalId.toString();
      }
    }
    return value;
  }

  changeShowData(idx) {
    this.isDisplay[idx] = !this.isDisplay[idx];
  }
}
