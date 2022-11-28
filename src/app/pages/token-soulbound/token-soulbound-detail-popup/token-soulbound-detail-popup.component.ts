import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {EnvironmentService} from "src/app/core/data-services/environment.service";

@Component({
  selector: 'app-token-soulbound-detail-popup',
  templateUrl: './token-soulbound-detail-popup.component.html',
  styleUrls: ['./token-soulbound-detail-popup.component.scss']
})
export class TokenSoulboundDetailPopupComponent implements OnInit {
  isError = false;
  image_s3 = this.environmentService.configValue.image_s3;
  defaultImgToken = this.image_s3 + 'images/aura__ntf-default-img.png';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TokenSoulboundDetailPopupComponent>,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
  }

  error(): void {
    this.isError = true;
  }

  closeDialog() {
    this.dialogRef.close('canceled');
  }

}
