import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
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
  getCoinMarketChartById(
    id: string,
    {
      from,
      to,
    }: {
      from: number;
      to: number;
    },
  ) {
    return this.http
      .get<any>(`${this.coingecko.url}/coins/${id}/market_chart/range`, {
        params: {
          vs_currency: 'usd',
          from,
          to,
        },
      })
      .pipe(
        map((res) => {
          const { prices } = res;
          console.log(prices);

          if (prices) {
            const data = prices.map((data) => {
              return {
                timestamp: new Date(data[0]).toISOString(),
                current_price: data[1],
              };
            });
            return { data };
          }
          return { data: [] };
        }),
      );
  }
}
