import { Component, OnInit } from '@angular/core';
import { timer } from 'rxjs';
import { debounce, tap } from 'rxjs/operators';
import { DialogService } from '../../core/services/dialog.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent implements OnInit {
  enableOutSide = false;
  dialogState$ = this.dialogService.dialogState$.pipe(
    debounce(() => timer(2)),
    tap((e) => {
      this.enableOutSide = e.show;
    }),
  );
  constructor(private dialogService: DialogService) {}

  ngOnInit(): void {}

  close(): void {
    this.dialogService.hideDialog();
  }

  clickOutside(isShow): void {
    if (this.enableOutSide) {
      isShow && this.dialogService.hideDialog();
    }
  }
}
