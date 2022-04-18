import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent implements OnInit, AfterViewInit, OnChanges {
  @Output() paginator: EventEmitter<MatPaginator> = new EventEmitter<MatPaginator>();
  @Output() pageEvent: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  @Input() length: number;
  @Input() actualLength: number;

  @Input() pageSize: number;
  @Input() pageOption: number;

  @ViewChild(MatPaginator) _paginator: MatPaginator;

  pageList: { index: number; isActive: boolean }[] = [];

  current: {
    pageIndex: number;
    isLast: boolean;
    isFirst: boolean;
    list: { index: number; isActive: boolean }[];
  };

  PAGE = {
    max: 5,
    avgIdx: 2,
  };

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.length) {
      this.pageList = Array.from({ length: this.length }, (_, k) => ({
        index: k,
        isActive: false,
      }));
      this.changePage();
    }
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.paginator.emit(this._paginator);
  }

  prevPage(): void {
    this.selectPage(this.current.pageIndex - 1);
  }

  nextPage(): void {
    this.selectPage(this.current.pageIndex + 1);
  }

  selectPage(pageIndex): void {
    this._paginator.pageIndex = pageIndex;
    this.current.pageIndex = pageIndex;
    this.changePage();
  }

  changePage(): void {
    const list = [...this.pageList];
    if (this.current) {
      const pageIndex = this.current.pageIndex;

      this.current.isFirst = pageIndex > 0 ? false : true;
      this.current.isLast = pageIndex < this.length - 1 ? false : true;

      if (pageIndex <= this.PAGE.avgIdx || this.length <= this.PAGE.max) {
        this.current.list = list.slice(0, this.PAGE.max);
      } else {
        let idx = pageIndex - this.PAGE.avgIdx;
        const isMax = idx + this.PAGE.max > this.length;

        idx = isMax ? this.length - this.PAGE.max : idx;
        this.current.list = list.slice(idx, this.PAGE.max + idx);
      }
      this.current.list.forEach((e) => {
        e.isActive = e.index === pageIndex;
      });
    } else {
      this.current = {
        pageIndex: 0,
        list: list.slice(0, this.PAGE.max),
        isFirst: true,
        isLast: false,
      };
      this.current.list[0].isActive = true;
    }
  }
}
