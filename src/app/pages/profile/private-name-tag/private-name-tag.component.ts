import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogConfig as MatDialogConfig,
} from '@angular/material/legacy-dialog';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { PAGE_EVENT, STORAGE_KEYS, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import {
  transferAddress
} from 'src/app/core/utils/common/address-converter';
import local from 'src/app/core/utils/storage/local';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { PopupCommonComponent } from 'src/app/shared/components/popup-common/popup-common.component';
import { PopupNameTagComponent } from './popup-name-tag/popup-name-tag.component';

@Component({
  selector: 'app-private-name-tag',
  templateUrl: './private-name-tag.component.html',
  styleUrls: ['./private-name-tag.component.scss'],
})
export class PrivateNameTagComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;

  templates: Array<TableTemplate> = [
    { matColumnDef: 'favorite', headerCellDef: 'Fav', headerWidth: 65 },
    { matColumnDef: 'cosmosAddress', headerCellDef: 'Cosmos Add', headerWidth: 145 },
    { matColumnDef: 'evmAddress', headerCellDef: 'EVM Add', headerWidth: 120 },
    { matColumnDef: 'type', headerCellDef: 'Type', headerWidth: 80 },
    { matColumnDef: 'name_tag', headerCellDef: 'Private Name Tag', headerWidth: 260 },
    { matColumnDef: 'createdAt', headerCellDef: 'Added Time', headerWidth: 150 },
    { matColumnDef: 'updatedAt', headerCellDef: 'Updated Time', headerWidth: 150 },
    { matColumnDef: 'action', headerCellDef: '', headerWidth: 82 },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  countFav = 0;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  textSearch = '';
  searchSubject = new Subject();
  destroy$ = new Subject<void>();
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  dataSourceMobile = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  quota = this.environmentService.chainConfig.quotaSetPrivateName;
  prefixAdd = this.environmentService.chainInfo.bech32Config.bech32PrefixAccAddr;
  isLoading = true;
  errTxt: string;
  chainInfo = this.environmentService.chainInfo;

  constructor(
    public commonService: CommonService,
    public nameTagService: NameTagService,
    private dialog: MatDialog,
    private toastr: NgxToastrService,
    private environmentService: EnvironmentService,
  ) {}

  ngAfterViewInit(): void {
    const dataNameTag = local.getItem(STORAGE_KEYS.SET_ADDRESS_NAME_TAG);
    if (dataNameTag && dataNameTag !== 'undefined') {
      local.removeItem(STORAGE_KEYS.SET_ADDRESS_NAME_TAG);

      this.openPopup(dataNameTag, true);
    }
  }

  ngOnInit(): void {
    this.getListPrivateName();
    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageChange.selectPage(0);
      });
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
    this.destroy$.next();
    this.destroy$.complete();
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  resetFilterSearch() {
    this.textSearch = '';
    this.onKeyUp();
  }

  getListPrivateName() {
    this.textSearch = this.textSearch?.trim();
    const payload = {
      limit: this.pageData.pageSize,
      keyword: this.textSearch || '',
      offset: this.pageData.pageIndex * this.pageData.pageSize,
    };

    this.nameTagService.getListPrivateNameTag(payload).subscribe({
      next: (res) => {
        this.countFav = res.meta.countFavorite || 0;
        if (this.textSearch?.length > 0) {
          this.countFav = 0;
          //check record isFavorite
          if (res.data?.length > 0 && res.data[0].isFavorite == 1) {
            this.countFav = 1;
          }
        }
        if (res.data.length > 0) {
          res.data.forEach((data) => {
            const { accountAddress, accountEvmAddress } = transferAddress(
              this.chainInfo.bech32Config.bech32PrefixAccAddr,
              data.address,
            );
            data.cosmosAddress = accountAddress;
            data.evmAddress = accountEvmAddress;
          });
        }
        this.dataSource.data = res.data;
        this.pageData.length = res?.meta?.count || 0;

        if (this.dataSource?.data) {
          let dataMobTemp = this.dataSource.data?.slice(
            this.pageData.pageIndex * this.pageData.pageSize,
            this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
          );
          if (dataMobTemp.length !== 0) {
            this.dataSourceMobile = dataMobTemp;
          } else {
            this.dataSourceMobile = this.dataSource.data?.slice(
              (this.pageData.pageIndex - 1) * this.pageData.pageSize,
              (this.pageData.pageIndex - 1) * this.pageData.pageSize + this.pageData.pageSize,
            );
          }
        }
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.error.error.statusCode + ' ' + e.error.error.message;
        }
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  openPopup(data = null, isGetDetail = false) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'grant-overlay-panel';
    dialogConfig.disableClose = true;
    if (data) {
      data['isGetDetail'] = isGetDetail;
      dialogConfig.data = data;
    }
    dialogConfig.data = { ...dialogConfig.data, ...{ currentLength: this.pageData?.length } };
    let dialogRef = this.dialog.open(PopupNameTagComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        setTimeout(() => {
          this.getListPrivateName();
          this.storeListNameTag();
        }, 3000);
      }
    });
  }

  openPopupDelete(data) {
    let dialogRef = this.dialog.open(PopupCommonComponent, {
      panelClass: 'sizeNormal',
      data: {
        title: 'Remove Private Name Tag',
        content: 'Are you sure to remove private name tag for the address ' + data.address + ' (' + data.nameTag + ')?',
        class: 'text--gray-1',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result !== 'canceled') {
        this.deleteNameTag(data.id);
      }
    });
  }

  deleteNameTag(id) {
    this.nameTagService.deletePrivateNameTag(id).subscribe((res) => {
      if (res.code && res.code !== 200) {
        this.toastr.error(res.message || 'Error');
        return;
      }

      this.toastr.successWithTitle('Private name tag removed!', 'Success');
      setTimeout(() => {
        this.pageData.length--;
        this.pageChange.selectPage(0);
        this.storeListNameTag();
      }, 2000);
    });
  }

  updateFavorite(data) {
    const payload = {
      id: data.id,
      isFavorite: !data.isFavorite,
    };

    this.nameTagService.updatePrivateNameTag(payload).subscribe((res) => {
      setTimeout(() => {
        this.getListPrivateName();
      }, 2000);
    });
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListPrivateName();
  }

  urlType(data, address) {
    let result = '/address/';
    let linkAddress = address;
    if (data.type === 'contract') {
      result = data?.evmAddress ? '/evm-contracts/' : '/contracts/';
      linkAddress = data?.evmAddress || linkAddress;
    }
    return [result, linkAddress];
  }

  async storeListNameTag() {
    const payloadPrivate = {
      limit: 100,
      offset: 0,
      keyword: null,
    };

    const listNameTag = local.getItem<[]>(STORAGE_KEYS.LIST_NAME_TAG);
    this.nameTagService.getListPrivateNameTag(payloadPrivate).subscribe((privateName) => {
      this.nameTagService.listNameTag = listNameTag;
      let listTemp = this.nameTagService.listNameTag?.map((element) => {
        const address = _.get(element, 'address');
        let name_tag = _.get(element, 'name_tag');
        let isPrivate = false;
        let name_tag_private = null;
        let id;
        const enterpriseUrl = _.get(element, 'enterpriseUrl');
        let privateData = privateName?.data?.find((k) => k.address === address);
        if (privateData) {
          name_tag_private = privateData.nameTag;
          isPrivate = true;
          id = privateData.id;
        }
        return { address, name_tag, isPrivate, enterpriseUrl, name_tag_private, id };
      });

      // get other data of private list
      const isSameUser = (listTemp, privateName) => listTemp?.address === privateName.address;
      const onlyInLeft = (left, right, compareFunction) =>
        left.filter((leftValue) => !right.some((rightValue) => compareFunction(leftValue, rightValue)));
      const lstPrivate = onlyInLeft(privateName?.data, listTemp, isSameUser);
      lstPrivate.forEach((element) => {
        element['name_tag_private'] = element.nameTag;
        element['nameTag'] = null;
        element['isPrivate'] = true;
      });
      const result = [...listTemp, ...lstPrivate];
      this.nameTagService.listNameTag = [...result];
      local.setItem(STORAGE_KEYS.LIST_NAME_TAG, result);
    });
  }
}
