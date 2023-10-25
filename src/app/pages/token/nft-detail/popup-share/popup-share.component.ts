import { Component, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { WalletService } from 'src/app/core/services/wallet.service';

@Component({
  selector: 'app-popup-share',
  templateUrl: './popup-share.component.html',
  styleUrls: ['./popup-share.component.scss'],
})
export class PopupShareComponent implements OnInit {
  isLoading = false;
  walletAccount: any;
  shareLink = '';

  modeShare = {
    telegram: 0,
    facebook: 1,
    twitter: 2,
  };

  constructor(
    public dialogRef: MatDialogRef<PopupShareComponent>,
    public walletService: WalletService,
    public environmentService: EnvironmentService,
    private router: Router,
    public commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.shareLink = this.router['location']._platformLocation.location.href || '';
  }

  closeDialog(isConfirm = false) {
    this.dialogRef.close(isConfirm);
  }

  connectWallet(): void {
    this.walletAccount = this.walletService.getAccount();
  }

  executeShareLink(mode) {
    let content = 'View this token details on Aurascan:';
    let result = '';

    switch (mode) {
      case this.modeShare.telegram:
        result = 'https://t.me/share/url?url=' + encodeURIComponent(this.shareLink);
        break;
      case this.modeShare.facebook:
        result = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(this.shareLink);
        break;
      case this.modeShare.twitter:
        result =
          'https://twitter.com/intent/tweet?text=' +
          encodeURIComponent(content) +
          '&url=' +
          encodeURIComponent(this.shareLink) +
          '&original_referer=' +
          this.shareLink;
        break;
      default:
        result = '';
    }

    window.open(result, '_blank');
  }

  mouseEnter(item: string) {
    document.getElementById(item).classList.remove('icon--light-gray');
    document.getElementById(item).classList.add('icon--multi-color');
  }

  mouseLeave(item: string) {
    document.getElementById(item).classList.add('icon--light-gray');
    document.getElementById(item).classList.remove('icon--multi-color');
  }
}
