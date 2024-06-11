import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, lastValueFrom } from 'rxjs';
import { FeatureFlags } from '../constants/feature-flags.enum';

@Injectable()
export class FeatureFlagService {
  private configUri = './assets/config/feature-flags.json';
  private flags: BehaviorSubject<Record<string, boolean>> = new BehaviorSubject({});

  private destroyed$ = new Subject<void>();
  constructor(private http: HttpClient) {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private loadConfig() {
    return lastValueFrom(this.http.get<Record<string, boolean>>(this.configUri))
      .then((config) => {
        this.flags.next(config);
      })
      .catch((err: any) => {
        console.error(err);
      });
  }

  async load(): Promise<void> {
    await this.loadConfig();
  }

  isEnabled(flag: FeatureFlags) {
    return this.flags.value[flag] || false;
  }
}
