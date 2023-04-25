import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { MEDIA_TYPE, PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { SB_TYPE } from 'src/app/core/constants/soulbound.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { CommonService } from 'src/app/core/services/common.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { checkTypeFile } from 'src/app/core/utils/common/info-common';
import { SoulboundTokenDetailPopupComponent } from '../../soulbound-token-detail-popup/soulbound-token-detail-popup.component';
import {WSService} from "src/app/core/services/ws.service";

@Component({
  selector: 'app-soulbound-token-unequipped',
  templateUrl: './soulbound-token-unequipped.component.html',
  styleUrls: ['./soulbound-token-unequipped.component.scss'],
})
export class SoulboundTokenUnequippedComponent implements OnInit, OnChanges {
  @Input() reloadAPI: boolean = false;
  @Output() totalUnEquip = new EventEmitter<number>();
  @Output() totalNotify = new EventEmitter<number>();

  textSearch = '';
  searchValue = '';
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  loading = false;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  // soulboundData param use for paginator
  soulboundData: MatTableDataSource<any> = new MatTableDataSource();
  currentAddress = '';
  sbType = SB_TYPE;
  isClick = false;
  MEDIA_TYPE = MEDIA_TYPE;
  isError = false;

  constructor(
    public dialog: MatDialog,
    private soulboundService: SoulboundService,
    private route: ActivatedRoute,
    public commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private contractService: ContractService,
    private wSService: WSService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params?.address) {
        this.currentAddress = params?.address;
        this.getListSB();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getListSB();
  }

  searchToken() {
    this.textSearch = this.searchValue;
    this.getListSB();
  }

  resetSearch() {
    this.textSearch = '';
    this.searchValue = '';
    this.getListSB();
  }

  getListSB() {
    this.reloadAPI = false;
    this.loading = true;
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      receiverAddress: this.currentAddress,
      keyword: this.textSearch?.trim(),
    };

    this.soulboundService.getListSoulboundByAddress(payload).subscribe((res) => {
      this.soulboundData.data = res.data;
      this.pageData.length = res.meta.count;
      this.totalUnEquip.emit(this.pageData.length);
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

  getSBTDetail(contractAddress, tokenID, isNotify) {
    this.isClick = true;
    this.contractService.getNFTDetail(contractAddress, tokenID).subscribe((res) => {
      if (res?.data) {
        this.openDialogDetail(res.data);
        if (isNotify) {
          this.updateNotify(contractAddress, tokenID);
        }
      }
      this.isClick = false;
    });
  }

  openDialogDetail(SBT) {
    let dialogRef = this.dialog.open(SoulboundTokenDetailPopupComponent, {
      panelClass: 'TokenSoulboundDetailPopup',
      data: SBT,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== 'canceled') {
        setTimeout(() => {
          this.getListSB();
        }, 4000);
      }
    });
  }

  getTypeFile(nft: any) {
    let nftType = checkTypeFile(nft);
    return nftType;
  }

  error(): void {
    this.isError = true;
  }

  updateNotify(contractAddress, tokenID) {
    this.soulboundService.updateNotify(contractAddress, tokenID).subscribe((res) => {
      setTimeout(() => {
        this.getListSB();
        this.getABTNotify();
      }, 1000);
    });
  }

  getABTNotify(): void {
    this.soulboundService.getNotify(this.currentAddress).subscribe((res) => {
      this.totalNotify.emit(res.data.notify);
      this.getListSB();
      this.cdr.markForCheck();
    });

    this.wSService.subscribeABTNotify(
      () => {
        this.getListSB();
      },
      () => {},
    );
  }
}
