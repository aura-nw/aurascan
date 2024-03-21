import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { NgHttpCachingHeaders } from 'ng-http-caching';
import { BehaviorSubject, catchError, map, Observable, of, shareReplay, take, tap } from 'rxjs';
import { CHART_RANGE } from '../constants/common.constant';
import { EnvironmentService } from './environment.service';

@Injectable({ providedIn: 'root' })
export class CoingeckoService {
  coingecko = this.env.coingecko;
  coinIds = this.coingecko.ids;

  private _coinsMarket$ = new BehaviorSubject([]);

  get coinsMarket$() {
    return this._coinsMarket$.pipe(take(1));
  }

  set coinsMarket(coinsMarket) {
    this._coinsMarket$.next(coinsMarket);
  }

  coinMarketShare$ = this.coinsMarket$.pipe(take(1), shareReplay(1));

  cacheChartData = {
    [CHART_RANGE.H_24]: [],
    [CHART_RANGE.D_7]: [],
    [CHART_RANGE.D_30]: [],
    [CHART_RANGE.MONTH_12]: [],
  };

  constructor(private http: HttpClient, private env: EnvironmentService) {}

  getChartData(
    id: string,
    ranges: {
      from?: number;
      to?: number;
      days?: number;
    },
    {
      type,
      isLoadMore,
    }: {
      type: string;
      isLoadMore?: boolean;
    },
  ) {
    const resData = this.cacheChartData[type];

    if (resData?.length > 0 && !isLoadMore) {
      return of({ data: resData });
    }

    return this.getCoinMarketChartById(id, ranges).pipe(
      tap((res) => {
        if (isLoadMore) {
          this.cacheChartData[type] = [...res.data];
        } else {
          this.cacheChartData[type] = [...this.cacheChartData[type], ...res.data];
        }
      }),
    );
  }

  getCoinMarketChartById(
    id: string,
    {
      from,
      to,
      days,
    }: {
      from?: number;
      to?: number;
      days?: number;
    },
  ) {
    if (!id) {
      return of({ data: [] });
    }

    const request = days
      ? this.http.get<any>(`${this.coingecko.url}/coins/${id}/market_chart`, {
          params: {
            vs_currency: 'usd',
            days,
          },

          headers: {
            [NgHttpCachingHeaders.ALLOW_CACHE]: '1',
          },
        })
      : this.http.get<any>(`${this.coingecko.url}/coins/${id}/market_chart/range`, {
          params: {
            vs_currency: 'usd',
            from,
            to,
          },

          headers: {
            [NgHttpCachingHeaders.ALLOW_CACHE]: '1',
          },
        });

    return request.pipe(
      map((res) => {
        const { prices } = res;

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
