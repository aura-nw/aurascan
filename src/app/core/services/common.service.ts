import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { formatDistanceToNowStrict } from 'date-fns';
import { BehaviorSubject, Observable } from 'rxjs';
import { DATEFORMAT } from '../constants/common.constant';
import { EnvironmentService } from '../data-services/environment.service';
import { formatTimeInWords, formatWithSchema } from '../helpers/date';
@Injectable()
export class CommonService {
  apiUrl = '';
  private networkQuerySubject: BehaviorSubject<any>;
  public networkQueryOb: Observable<any>;
  constructor(
    private _http: HttpClient,
    private _environmentService: EnvironmentService
  ) {
    this.apiUrl = `${this._environmentService.apiUrl.value.cosmos}`;
    const currentNetwork = JSON.parse(localStorage.getItem('currentNetwork'));
    this.networkQuerySubject = new BehaviorSubject<any>(currentNetwork?.value || 2);
    this.networkQueryOb = this.networkQuerySubject.asObservable();
  }

  public get getNetwork(): any {
    return this.networkQuerySubject.value;
  }

  public set setNetwork(data: any) {
    this.networkQuerySubject.next(data);
  }

  status(): Observable<any> {
    this.setURL();
    return this._http.get<any>(`${this.apiUrl}/status`);
  }

  channels(limit, offset): Observable<any> {
    this.setURL();
    return this._http.get<any>(`${this.apiUrl}/channels?limit=${limit}&offset=${offset}`);
  }

  chaincodes(limit, offset): Observable<any> {
    this.setURL();
    return this._http.get<any>(`${this.apiUrl}/chaincodes?limit=${limit}&offset=${offset}`);
  }

  peers(limit, offset): Observable<any> {
    this.setURL();
    return this._http.get<any>(`${this.apiUrl}/peers?limit=${limit}&offset=${offset}`);
  }

  delegators(limit, offset, address): Observable<any> {
    this.setURL();
    return this._http.get<any>(`${this.apiUrl}/validators/${address}/delegations?limit=${limit}&offset=${offset}`);
  }

  setURL() {
    if (this.networkQuerySubject.value === 1) {
      this.apiUrl = `${this._environmentService.apiUrl.value.fabric}`;
    }
    if (this.networkQuerySubject.value === 2) {
      this.apiUrl = `${this._environmentService.apiUrl.value.cosmos}`;
    }
  }

  getDateValue(time, isCustom = true) {
    if (time) {
      try {
        //get custom function format date if isCustom
        return isCustom ? [
          formatTimeInWords(new Date(time).getTime()),
          `(${formatWithSchema(new Date(time).getTime(), DATEFORMAT.DATETIME_UTC)})`,
        ] :  formatDistanceToNowStrict(new Date(time).getTime())
      } catch (e) {
        return [time, ''];
      }
    } else {
      return ['-', ''];
    }
  }
}
