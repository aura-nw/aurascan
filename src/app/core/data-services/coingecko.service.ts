import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { BehaviorSubject, catchError, map, mergeMap, Observable, of, shareReplay, Subject, take, tap } from 'rxjs';
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

  getChartData(
    id: string,
    {
      from,
      to,
    }: {
      from: number;
      to: number;
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

    return this.getCoinMarketChartById(id, { from, to }).pipe(
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
    }: {
      from: number;
      to: number;
    },
  ) {
    if (!id) {
      return of({ data: [] });
    }

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

  getCoinById(id: string) {
    if (!id) {
      return of({ data: null });
    }
    return this.http.get<any>(`${this.coingecko.url}/coins/${id}`).pipe(
      map((res) => {
        const data = {
          coinId: _.get(res, 'id'),
          current_price: _.get(res, "market_data.current_price['usd']"),
          market_cap: _.get(res, "market_data.market_cap['usd']"),
          max_supply: _.get(res, 'market_data.max_supply'),
          price_change_percentage_24h: _.get(res, 'market_data.price_change_percentage_24h'),
          timestamp: moment(_.get(res, 'market_data.last_updated')).unix().toString(),
          total_volume: _.get(res, "market_data.total_volume['usd']"),
          symbol: _.get(res, 'symbol'),
        };

        return {
          data,
        };
      }),
    );
  }
}
