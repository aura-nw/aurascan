import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface IDialog {
  title: string;
  content: string;
  show?: boolean;
  callback?: () => void
}
@Injectable({
  providedIn: 'root',
})
export class DialogService {
  dialogState$: Observable<IDialog>;
  private _dialogState$: BehaviorSubject<IDialog>;
  constructor() {
    const initial: IDialog = {
      show: false,
      content: '',
      title: '',
    };
    this._dialogState$ = new BehaviorSubject(initial);
    this.dialogState$ = this._dialogState$.asObservable();
  }

  showDialog(dta: IDialog): void {
    this._dialogState$.next({
      ...dta,
      show: true,
    });
  }

  hideDialog(): void {
    this._dialogState$.next({
      show: false,
      content: '',
      title: '',
    });
  }
}
