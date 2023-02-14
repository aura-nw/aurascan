import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-code-detail',
  templateUrl: './code-detail.component.html',
  styleUrls: ['./code-detail.component.scss'],
})
export class CodeDetailComponent implements OnInit {
  codeId;
  tabIndex = 0;
  TAB = [
    {
      id: 0,
      value: 'Contracts',
    },
    {
      id: 1,
      value: 'Verify Code ID',
    },
  ];
  constructor(private router: ActivatedRoute, public route: Router) {}

  ngOnInit(): void {
    this.codeId = this.router.snapshot.paramMap.get('codeId');
    if (this.codeId === 'null') {
      this.route.navigate(['/']);
    } else {
      this.getCodeDetail();
    }
  }
  getCodeDetail() {}
}
