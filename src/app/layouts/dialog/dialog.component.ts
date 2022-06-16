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
  dialogData = null;

  isInnerText = false;

  dialogState$ = this.dialogService.dialogState$.pipe(
    debounce(() => timer(2)),
    tap((e) => {
      this.dialogData = e;
      this.enableOutSide = e.show;

      if (e.content.includes('<br>')) {
        this.isInnerText = true;
      }
    }),
  );
  constructor(private dialogService: DialogService) {}

  ngOnInit(): void {}

  close(): void {
    if (this.dialogData?.callback) {
      this.dialogData.callback();
    }
    this.dialogService.hideDialog();
  }

  clickOutside(isShow): void {
    if (this.enableOutSide) {
      isShow && this.dialogService.hideDialog();
    }
  }
}
