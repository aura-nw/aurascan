import { Component, OnInit } from '@angular/core';
import {PageEvent} from "@angular/material/paginator";
import {PAGE_EVENT} from "src/app/core/constants/common.constant";
import {MAX_LENGTH_SEARCH_TOKEN} from "src/app/core/constants/token.constant";

@Component({
  selector: 'app-token-soulbound-contract-list',
  templateUrl: './token-soulbound-contract-list.component.html',
  styleUrls: ['./token-soulbound-contract-list.component.scss']
})
export class TokenSoulboundContractListComponent implements OnInit {

  textSearch = '';
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  constructor() { }

  ngOnInit(): void {
  }

  searchToken() {}
  resetSearch() {
    this.textSearch = '';
  }

}
