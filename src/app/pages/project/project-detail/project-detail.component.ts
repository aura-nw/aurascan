import {AfterViewChecked, Component, OnInit} from '@angular/core';
const marked = require('marked');

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit, AfterViewChecked {
  loading = true;
  projectData;
  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.projectData = {
        projectName: 'Demo project',
        codeIds: [
          { euphoria_code_id: '12', mainnet_code_id: '23' },
          { euphoria_code_id: '13', mainnet_code_id: '21' },
          { euphoria_code_id: '14', mainnet_code_id: '31' }
        ],
        official_project_website: 'Demo.com.vn',
        official_project_email: 'Demo@gmail.com',
        creator: 'Demo 001',
        socialProfiles: {
          whitepaper: 'Demo.com.vn',
          medium: 'Demo.com.vn',
          github: 'Demo.com.vn',
          reddit: 'Demo.com.vn',
          telegram: 'Demo.com.vn',
          slack: 'Demo.com.vn',
          weChat: 'Demo.com.vn',
          facebook: 'Demo.com.vn',
          linkedin: 'Demo.com.vn',
          twitter: 'Demo.com.vn',
          discord: 'Demo.com.vn',
          bit_coin_talk: 'Demo.com.vn',
        },
        description: 'This is a description!'
      };
      this.loading = false
    }, 500);
  }


  ngAfterViewChecked(): void {
    const editor = document.getElementById('marked');
    if (editor && this.projectData) {
      editor.innerHTML = marked.parse(this.projectData.description);
      return;
    }
  }

}
