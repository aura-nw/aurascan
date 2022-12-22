import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { SB_TYPE } from 'src/app/core/constants/soulbound.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { CommonService } from 'src/app/core/services/common.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { TokenSoulboundDetailPopupComponent } from 'src/app/pages/token-soulbound/token-soulbound-detail-popup/token-soulbound-detail-popup.component';

@Component({
  selector: 'app-token-soulbound-unequipped',
  templateUrl: './token-soulbound-unequipped.component.html',
  styleUrls: ['./token-soulbound-unequipped.component.scss'],
})
export class TokenSoulboundUnequippedComponent implements OnInit {
  textSearch = '';
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  tokenList = [
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: false,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true,
    },
    {
      id: 3933,
      name: 'Aureliana',
      address: 'aura1uqlvry8tdypf0wxk9j5cyc0sghuuujnn82g0jgmjmcy5dg6ex6zs0ytagx',
      img: 'assets/images/soulboundToken.png',
      isClaimed: true,
    },
  ];
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
  currentAddress = '';
  sbType = SB_TYPE;
  isClick = false;

  constructor(
    public dialog: MatDialog,
    private soulboundService: SoulboundService,
    private route: ActivatedRoute,
    public commonService: CommonService,
    private contractService: ContractService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params?.address) {
        this.currentAddress = params?.address;
        this.getListSB();
      }
    });
  }

  searchToken() {
    this.getListSB(this.textSearch);
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
      receiverAddress: this.currentAddress,
      keyword: keySearch?.trim(),
    };

    this.soulboundService.getListSoulboundByAddress(payload).subscribe((res) => {
      this.soulboundData.data = res.data;
      this.pageData.length = res.meta.count;
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

  getSBTDetail(contractAddress, tokenID) {
    this.isClick = true;
    this.contractService.getNFTDetail(contractAddress, tokenID).subscribe((res) => {
      this.isClick = false;
      if (res) {
        this.openDialogDetail(res.data);
      }
    });
  }

  openDialogDetail(SBT) {
    let dialogRef = this.dialog.open(TokenSoulboundDetailPopupComponent, {
      panelClass: 'TokenSoulboundDetailPopup',
      data: SBT,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result !== 'canceled') {
      }
    });
  }
}
