import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {EnvironmentService} from "src/app/core/data-services/environment.service";
import {CommonService} from "src/app/core/services/common.service";

@Injectable({ providedIn: 'root' })
export class ChartService extends CommonService {
    public dailyTransactionChart: Observable<any>;
    public uniqueAddressChart: Observable<any>;
    public dailyAddressChart: Observable<any>;

    constructor(
        private http: HttpClient,
        private environmentService: EnvironmentService
    ) {
        super(http, environmentService);
        // setInterval(()=> {
        //     this.dailyAddressChart = this.getDailyAddressChartData();
        //     this.uniqueAddressChart = this.getUniqueAddressChartData();
        //     this.dailyTransactionChart = this.getDailyTransactionChartData()
        // }, 8000);
    }

    // getDailyTransactionChartData(): Observable<any> {
    //     // return this.http.get<any>(`${this.apiUrl}/`);
    //     return '';
    // }

    // getUniqueAddressChartData(): Observable<any> {
    //     // return this.http.get<any>(`${this.apiUrl}/`);
    //     return '';
    // }

    // getDailyAddressChartData(): Observable<any> {
    //     // return this.http.get<any>(`${this.apiUrl}/`);
    //     return '';
    // }
}
