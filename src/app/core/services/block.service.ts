import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class BlockService extends CommonService {
  apiUrl = `${this.environmentService.configValue.beUri}`;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  blocks(limit: string | number, offset: string | number): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/blocks?limit=${limit}&offset=${offset}`);
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
    // return this.http.get<any>(`${this.apiUrl}/metrics/blocks?range=${type}`);
    //let character = this.http.get<any>(`${this.apiUrl}/metrics/blocks?range=${type}`);
    //let characterHomeWorld =
    return this.http.get<any>(`${this.apiUrl}/metrics/transactions?range=${type}`);
  }

  getLastBlock(validator_address): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/blocks/${validator_address}/latest`);
  }
}
