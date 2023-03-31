import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CONTRACT_RESULT } from 'src/app/core/constants/contract.constant';
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
  contractResult = CONTRACT_RESULT;

  constructor(private router: ActivatedRoute, public route: Router, private contractService: ContractService) {}

  ngOnInit(): void {
    this.codeId = this.router.snapshot.paramMap.get('codeId');
    if (localStorage.getItem('isVerifyTab') == 'true') {
      this.tabIndex = 1;
      localStorage.setItem('isVerifyTab', null);
    }

    if (this.codeId === 'null') {
      this.route.navigate(['/']);
    } else {
      this.getCodeIdDetail();
    }
  }

  getCodeIdDetail() {
    this.contractService.getCodeIDDetail(this.codeId).subscribe((res) => {
      this.codeIdDetail = res.data;
    });
  }
}
