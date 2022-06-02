import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResponseDto } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';

@Component({
  selector: 'app-contracts-detail',
  templateUrl: './contracts-detail.component.html',
  styleUrls: ['./contracts-detail.component.scss'],
})
export class ContractsDetailComponent implements OnInit {
  contractAddress: string | number;
  contractDetail: any;
  constructor(private route: ActivatedRoute, private contractService: ContractService) {}

  ngOnInit(): void {
    this.contractAddress = this.route.snapshot.paramMap.get('contractAddress');
    this.getContractDetail();
  }

  getContractDetail(): void {
    this.contractService.getContractDetail(this.contractAddress).subscribe((res: ResponseDto) => {
      this.contractDetail = res?.data;
      this.contractDetail.price = this.contractDetail.balance * 1;
      this.contractDetail.creator_address_format = this.contractDetail.creator_address.replace(
        this.contractDetail.creator_address.substring(20),
        '...',
      );
      this.contractDetail.tx_hash_format = this.contractDetail.tx_hash
        ? this.contractDetail.tx_hash.replace(this.contractDetail.tx_hash.substring(20), '...')
        : '';
    });
  }
}
