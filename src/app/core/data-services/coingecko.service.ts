import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of } from 'rxjs';
import { EnvironmentService } from './environment.service';

@Injectable({ providedIn: 'root' })
export class CoingeckoService {
  coingecko = this.env.coingecko;
  coinIds = this.coingecko.ids;

  coinsMarket$ = new BehaviorSubject([]);

  constructor(private http: HttpClient, private env: EnvironmentService) {}

  getCoinMarkets(ids: string[] = this.coinIds): Observable<any> {
    if (ids?.length === 0) {
      return of([]);
    }

    return this.http
      .get(`${this.coingecko.url}/coins/markets`, {
        params: {
          ids: ids.toString(),
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 250,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h',
          locale: 'en',
        },
      })
      .pipe(
        catchError((error) => {
          console.log(error);

          return of([]);
        }),
      );
  }
}
