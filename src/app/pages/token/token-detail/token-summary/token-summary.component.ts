import {Component, Input, OnInit} from '@angular/core';
import {ProjectService} from "src/app/core/services/project.service";
import {ProjectDetail} from "src/app/core/models/project";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
    selector: 'app-token-summary',
    templateUrl: './token-summary.component.html',
    styleUrls: ['./token-summary.component.scss'],
})
export class TokenSummaryComponent implements OnInit {
    @Input() tokenDetail: any;
    projectDetail: ProjectDetail;

    constructor(
        private projectService: ProjectService,
        private sanitizer:DomSanitizer
    ) {}

    ngOnInit(): void {
        if(!this.tokenDetail.request_id) {
            return;
        }
        this.projectService.projectDetail(this.tokenDetail.request_id).subscribe(res => {
            if (res && res.code === 200 && res.message === "Successful") {
              this.projectDetail = res.data;
            }
        })
    }
    sanitize(url:string){
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }
}
