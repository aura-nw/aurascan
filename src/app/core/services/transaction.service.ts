import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { INDEXER_URL } from 'src/app/core/constants/common.constant';
import { LCD_COSMOS } from '../constants/url.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class TransactionService extends CommonService {
  apiUrl = `${this.environmentService.configValue.beUri}`;
  chainInfo = this.environmentService.configValue.chain_info;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  txsIndexer(pageLimit: string | number, offset: string | number, txHash = ''): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      pageLimit,
      offset,
      txHash,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${INDEXER_URL}/transaction`, {
      params,
    });
  }

  txsDetailLcd(txhash: string) {
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.TX}/txs/${txhash}`);
  }

  getAccountTxFromHoroscope(chainId: string, address: string, pageLimit = 10, nextKey = null): Observable<any> {
    const params = _({
      chainid: chainId,
      address,
      pageLimit,
      nextKey,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${INDEXER_URL}/transaction`, {
      params,
    });
  }

  getListIBCSequence(sequence): Observable<any> {
    const params = _({
      chainid: this.chainInfo.chainId,
      pageLimit: 20,
      sequenceIBC: sequence,
    })
      .omitBy(_.isNull)
      .omitBy(_.isUndefined)
      .value();

    return this.http.get<any>(`${INDEXER_URL}/transaction`, {
      params,
    });
  }
}
