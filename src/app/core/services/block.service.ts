import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable } from 'rxjs';
import { LCD_COSMOS } from '../constants/url.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class BlockService extends CommonService {
  apiUrl = `${this.environmentService.configValue.beUri}`;
  chainInfo = this.environmentService.configValue.chain_info;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  blocksLastest(limit: string | number): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/blocks/get-blocks-latest?limit=${limit}`);
  }

  blockDetailById(blockId: string | number): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/blocks/id/${blockId}`);
  }

  blockDetail(height: string | number): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/blocks/${height}`);
  }

  blockWithOperator(limit: string | number, offset: string | number, operator_address: string): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/blocks/${operator_address}/validator?limit=${limit}&offset=${offset}`);
  }

  getBlockAndTxs(type: string): Observable<any> {
    this.setURL();
    return this.http.get<any>(
      `${this.apiUrl}/metrics/transactions?range=${type}&&timezone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    );
  }

  getLastBlock(validator_address): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/blocks/${validator_address}/latest`);
  }

  getBlockMiss(limit: number) {
    return axios.get(
      `${this.chainInfo.rest}/${LCD_COSMOS.SLASHING}/signing_infos?pagination.limit=${limit}&pagination.reverse=true`,
    );
  }

  getBlockMissByConsAddress(cons_address: string) {
    return axios.get(`${this.chainInfo.rest}/${LCD_COSMOS.SLASHING}/signing_infos/${cons_address}`);
  }
}
