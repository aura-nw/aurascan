import {AfterViewChecked, Component, OnInit} from '@angular/core';
import {ProjectService} from "src/app/core/services/project.service";
import {ActivatedRoute} from "@angular/router";
import {ProjectDetail} from "src/app/core/models/project";
const marked = require('marked');

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit, AfterViewChecked {
  projectDetail: ProjectDetail;
  loading = true;
  constructor(private route: ActivatedRoute, private projectService :ProjectService) { }

  async ngOnInit() {
    const requestId = this.route.snapshot.paramMap.get('id');
    if(requestId) {
      const rq = await this.projectService.projectDetail(+requestId).toPromise();
      if(rq && rq.code === 200 && rq.message === "Successful") {
        this.projectDetail = rq.data;
      }
      this.loading = false
    }
  }


  ngAfterViewChecked(): void {
    const editor = document.getElementById('marked');
    if (editor && this.projectDetail) {
      editor.innerHTML = marked.parse(this.projectDetail.contract_description);
      return;
    }
  }

}
