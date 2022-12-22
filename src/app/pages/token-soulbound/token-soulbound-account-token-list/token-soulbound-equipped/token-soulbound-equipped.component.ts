import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MatTableDataSource } from '@angular/material/table';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { ActivatedRoute } from '@angular/router';
import { SB_TYPE } from 'src/app/core/constants/soulbound.constant';
import { getKeplr } from 'src/app/core/utils/keplr';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-token-soulbound-equipped',
  templateUrl: './token-soulbound-equipped.component.html',
  styleUrls: ['./token-soulbound-equipped.component.scss'],
})
export class TokenSoulboundEquippedComponent implements OnInit {
  @Output() totalSBT = new EventEmitter<number>();

  textSearch = '';
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  tokenList = [
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: true,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: true,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: true,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: true,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isSelected: true,
    },
  ];
  countSelected = 0;
  loading = false;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  // soulboundData param use for paginator
  soulboundData: MatTableDataSource<any> = new MatTableDataSource();
  showData: any[];
  nextKey = null;
  currentKey = null;
  userAddress = '';
  sbType = SB_TYPE;
  network = this.environmentService.configValue.chain_info;

  constructor(
    private soulboundService: SoulboundService,
    private route: ActivatedRoute,
    private environmentService: EnvironmentService,
    private walletService: WalletService,
    public commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params?.address) {
        this.userAddress = params?.address;
        this.getListSB();
      }
    });
  }

  searchToken() {
    this.getListSB(this.textSearch)
  }

  resetSearch() {
    this.textSearch = '';
    this.getListSB();
  }

  getListSB(keySearch = '') {
    this.loading = true;
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      receiverAddress: this.userAddress,
      isEquipToken: true,
      keyword: keySearch?.trim()
    };

    this.soulboundService.getListSoulboundByAddress(payload).subscribe((res) => {
      this.countSelected = res.data.filter((k) => k.picked)?.length || 0;
      this.soulboundData.data = res.data;
      this.pageData.length = res.meta.count;
      this.totalSBT.emit(this.pageData.length);
    });
    this.loading = false;
  }

  paginatorEmit(event): void {
    if (this.soulboundData) {
      this.soulboundData.paginator = event;
    }
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListSB();
  }

  async updatePick(id, pick = true) {
    const currentAddress = this.walletService.wallet?.bech32Address;
    const keplr = await getKeplr();
    let dataKeplr = await keplr.signArbitrary(this.network.chainId, currentAddress, id.toString());

    const payload = {
      signature: dataKeplr.signature,
      msg: id.toString(),
      pubKey: dataKeplr.pub_key.value,
      id: id,
      picked: pick,
    };

    this.soulboundService.pickSBToken(payload).subscribe((res) => {
      this.getListSB();
    });
  }

  linkSBDetail(contractAddress, tokenID) {
    let encode = encodeURIComponent(tokenID);
    window.location.href = `/tokens/token-nft/${contractAddress}/${encode}`;
  }
}
