import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService } from 'src/app/core/services/contract.service';

@Component({
  selector: 'app-code-id-detail',
  templateUrl: './code-id-detail.component.html',
  styleUrls: ['./code-id-detail.component.scss'],
})
export class CodeIdDetailComponent implements OnInit {
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
  codeIdDetail;
  constructor(private router: ActivatedRoute, public route: Router, private contractService: ContractService) {}

  ngOnInit(): void {
    this.codeId = this.router.snapshot.paramMap.get('codeId');
    if (this.codeId === 'null') {
      this.route.navigate(['/']);
    } else {
      this.getCodeDetail();
    }
  }
  getCodeDetail() {
    this.contractService.getCodeIDDetail(this.codeId).subscribe((res) => {
      console.log(res);
      
      this.codeIdDetail = res.data;
    });
  }
}
