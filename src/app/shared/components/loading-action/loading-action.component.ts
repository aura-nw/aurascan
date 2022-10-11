import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';

@Component({
  selector: 'app-loading-action',
  templateUrl: './loading-action.component.html',
  styleUrls: ['./loading-action.component.scss'],
})
export class LoadingActionComponent implements OnInit {
  @Input() isLoadingAction: boolean;
  @Input() urlAction: string;
  currentUrl = '';
  constructor(private toastr: NgxToastrService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.urlAction && this.currentUrl !== changes.urlAction?.currentValue && this.isLoadingAction) {
      this.currentUrl = changes.urlAction?.currentValue;
      this.toastr.info(
        '<a href="' +
          this.urlAction +
          '"target="_blank" class="toastr-link">Check your transaction on the explorer</a>',
        'Transaction is in progress',
      );
    } else {
      this.toastr.clear();
    }
  }
}
