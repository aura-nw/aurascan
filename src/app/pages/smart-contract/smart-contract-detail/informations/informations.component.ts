import { Component, OnInit } from '@angular/core';
import { ADDRESS_PREFIX, VALIDATOR_ADDRESS_PREFIX } from '../../../../core/constants/common.constant';
import { TOKEN_TAB } from '../../../../core/constants/smart-contract.constant';
import { TokenTab } from '../../../../core/constants/smart-contract.enum';

@Component({
  selector: 'app-informations',
  templateUrl: './informations.component.html',
  styleUrls: ['./informations.component.scss'],
})
export class InformationsComponent implements OnInit {
  TABS = TOKEN_TAB.filter((vote) =>
    [TokenTab.Transfers, TokenTab.Holders, TokenTab.Info, TokenTab.Contract, TokenTab.Analytics].includes(vote.key),
  ).map((vote) => ({
    ...vote,
    value: vote.value,
    key: vote.key === TokenTab.Transfers ? '' : vote.key,
  }));
  countCurrent: string = '';
  textSearch: string = '';
  searchTemp: string = '';
  isSearchTx = false;
  isSearchAddres = false;
  resultSearch = 0;
  tabsBackup = this.TABS;

  constructor() {}

  ngOnInit(): void {}

  changeTab(tabId): void {
    this.countCurrent = tabId;
  }

  handleSearch() {
    const VALIDATORS = {
      HASHRULE: /^[A-Za-z0-9]/,
    };
    const regexRule = VALIDATORS.HASHRULE;
    this.searchTemp = this.searchTemp?.trim();
    this.isSearchTx = false;
    this.TABS = this.tabsBackup;

    if (regexRule.test(this.searchTemp)) {
      this.textSearch = this.searchTemp;

      setTimeout(() => {
        if (this.resultSearch > 0) {
          let tempTabs;
          if (this.textSearch.length > 60) {
            this.isSearchTx = true;
            tempTabs = this.TABS.filter((k) => k.key !== TokenTab.Holders && k.key !== TokenTab.Analytics);
          } else if (this.textSearch?.length >= 43 && this.textSearch?.startsWith(ADDRESS_PREFIX)) {
            this.isSearchAddres = true;
            tempTabs = this.TABS.filter((k) => k.key !== TokenTab.Holders);
          }
          this.TABS = tempTabs || this.tabsBackup;
        }
        else {
          this.textSearch = '';
        }
      }, 500);
    } 
  }

  getLength(result: string) {
    this.resultSearch = Number(result) || 0;
  }

  resetSearch() {
    this.searchTemp = null;
    this.textSearch = null;
    this.isSearchAddres = false;
    this.isSearchTx = false;
    this.handleSearch();
  }
}
