import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TokenService } from 'src/app/core/services/token.service';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-token-overview',
  templateUrl: './token-overview.component.html',
  styleUrls: ['./token-overview.component.scss'],
})
export class TokenOverviewComponent implements OnInit {
  @Input() tokenDetail: any;
  params = '';
  constructor(public global: Globals, private tokenService: TokenService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.params = params?.a || '';
    });
    this.getTotalTransfer();
  }

  getTotalTransfer() {
    this.tokenService.getListTokenTransfer(20, 0, this.tokenDetail?.contract_address).subscribe((res) => {
      this.tokenDetail['transfers'] = res.data?.transactions?.length || 0;
    });
  }
}
