import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';

@Injectable()
export class CommonService {
  apiUrl = `${this.environmentService.apiUrl.value.fabric}`;

  private networkQuerySubject: BehaviorSubject<any>;
  public networkQueryOb: Observable<any>;
  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService
  ) {
    const currentNetwork = JSON.parse(localStorage.getItem('currentNetwork'));
    this.networkQuerySubject = new BehaviorSubject<any>(currentNetwork?.value || 1);
    this.networkQueryOb = this.networkQuerySubject.asObservable();
  }

  public get getNetwork(): any {
    return this.networkQuerySubject.value;
  }

  public set setNetwork(data: any) {
    this.networkQuerySubject.next(data);
  }

  blocks(limit, offset): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/blocks?limit=${limit}&offset=${offset}`);
  }

  blockDetail(height): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/blocks/${height}`);
  }

  getBlocksPer(type): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/metrics/blocks?range=${type}`);
  }

  txs(limit, offset): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/transactions?limit=${limit}&offset=${offset}`);
  }

  txsDetail(txhash): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/transactions/${txhash}`);
  }

  getTxsPer(type): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/metrics/transactions?range=${type}`);
  }

  status(): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/status`);
  }

  channels(limit, offset): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/channels?limit=${limit}&offset=${offset}`);
  }

  chaincodes(limit, offset): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/chaincodes?limit=${limit}&offset=${offset}`);
  }

  peers(limit, offset): Observable<any> {
    this.setURL();
    return this.http.get<any>(`${this.apiUrl}/peers?limit=${limit}&offset=${offset}`);
  }

  getBlockAndTxs(type): Observable<any> {
    this.setURL();
    // return this.http.get<any>(`${this.apiUrl}/metrics/blocks?range=${type}`);
    let character = this.http.get<any>(`${this.apiUrl}/metrics/blocks?range=${type}`);
    let characterHomeworld = this.http.get<any>(`${this.apiUrl}/metrics/transactions?range=${type}`);

    return forkJoin([character, characterHomeworld]);
  }

  setURL() {
    if (this.networkQuerySubject.value === 1) {
      this.apiUrl = `${this.environmentService.apiUrl.value.fabric}`;
    }
    if (this.networkQuerySubject.value === 2) {
      this.apiUrl = `${this.environmentService.apiUrl.value.cosmos}`;
    }
  }
}
