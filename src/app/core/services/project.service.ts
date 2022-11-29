import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectService extends CommonService {
  apiAdminUrl = `${this.environmentService.configValue.urlAdmin}`;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  projectDetail(request_id: number): Observable<any> {
    return this.http.get<any>( `${this.apiAdminUrl}/request/project-details?request_id=${request_id}`);
  }
}
