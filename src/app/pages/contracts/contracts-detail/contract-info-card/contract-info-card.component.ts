import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LENGTH_CHARACTER } from 'src/app/core/constants/common.constant';
import { TYPE_CW4973 } from 'src/app/core/constants/contract.constant';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { CommonService } from 'src/app/core/services/common.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-contract-info-card',
  templateUrl: './contract-info-card.component.html',
  styleUrls: ['./contract-info-card.component.scss'],
})
export class ContractInfoCardComponent implements OnInit, OnChanges {
  @Input() contractDetail: any;
  contractRegisterType = ContractRegisterType;
  linkNft = 'token-nft';
  lengthNormalAddress = LENGTH_CHARACTER.ADDRESS;
  verifiedStatus = '';
  verifiedText = '';

  constructor(public commonService: CommonService, private tokenService: TokenService) {}

  ngOnInit(): void {
    this.getStatusVerify();
  }

  ngOnChanges(changes: SimpleChanges): void {
    setTimeout(() => {
      if (changes?.contractDetail?.currentValue?.name === TYPE_CW4973) {
        this.linkNft = 'token-abt';
      }
    }, 500);
  }

  extendLink(url) {
    url = url.match(/^https?:/) ? url : '//' + url;
    return url;
  }

  getStatusVerify(){
    this.tokenService.getTokenMarketData({ contractAddress: this.contractDetail.address }).subscribe((res) => {
      if (res?.length > 0) {
        this.verifiedStatus = res[0].verify_status;
        this.verifiedText = res[0].verify_text;
      }
    });
  }
}
