import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class BlockService extends CommonService {
  apiUrl = `${this.environmentService.apiUrl.value.cosmos}`;

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService
  ) {
    super(http, environmentService);
  }

  blocks(limit, offset): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/blocks?limit=${limit}&offset=${offset}`);
  }

  blockDetailById(blockId): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/blocks/id/${blockId}`);
  }

  blockDetail(height): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/blocks/${height}`);
  }

  blockWithOperator(limit, offset, operator_address): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/blocks/${operator_address}/validator?limit=${limit}&offset=${offset}`);
  }

  getBlocksPer(type): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/metrics/blocks?range=${type}`);
  }

  getBlockAndTxs(type): Observable<any> {
    this.setURL();
    // return this.http.get<any>(`${this.apiUrl}/metrics/blocks?range=${type}`);
    let character = this.http.get<any>(`${this.apiUrl}/metrics/blocks?range=${type}`);
    let characterHomeworld = this.http.get<any>(`${this.apiUrl}/metrics/transactions?range=${type}`);

    return forkJoin([character, characterHomeworld]);
  }

  getLastBlock(validator_address): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/blocks/${validator_address}/latest`);
  }
}
