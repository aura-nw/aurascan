import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { LegacyPageEvent as PageEvent, MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import * as _ from 'lodash';

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
  @Output() pageChangeRecord = new EventEmitter<number>();

  @Input() updateTime: string;

  @Input() length: number;
  @Input() actualLength: number;

  @Input() pageSize: number;
  @Input() pageOption: number;
  @Input() showSelectRecord = false;

  @ViewChild(MatPaginator) _paginator: MatPaginator;

  pageList: { index: number; isActive: boolean }[] = [];
  pageLength: number;

  pageRecordSize = [10, 25, 50];

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

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.changePageMax(_.get(this.current, 'list[0].index'));
    this.changePage();
  }

  constructor() {}

  ngOnChanges(): void {
    if (this.length) {
      this.pageLength = Math.ceil(this.length / this.pageSize);
      this.pageList = Array.from({ length: this.pageLength }, (_, k) => ({
        index: k,
        isActive: false,
      }));
      this.changePage();
    }
  }

  ngOnInit(): void {
    if (this.current?.list && this.current.list.length > 0) {
      this.changePageMax(this.current.list[0].index);
    }
    this.changePage();
  }

  ngAfterViewInit(): void {
    this.paginator.emit(this._paginator);

    this._paginator.page.subscribe((next) => {
      if (next.pageIndex === 0 && next.previousPageIndex !== 0) {
        this.selectPage(0);
      }
    });
  }

  prevPage(): void {
    this.changePageMax(this.current.list[0].index);
    this.selectPage(this.current.pageIndex - 1);
  }

  nextPage(): void {
    this.changePageMax(this.current.list[0].index);
    this.selectPage(this.current.pageIndex + 1);
  }

  selectPage(pageIndex): void {
    const prevPageIndex = Number(this._paginator.pageIndex);

    this._paginator.pageIndex = pageIndex;
    this._paginator.page.next({
      length: this._paginator.length,
      pageIndex: this._paginator.pageIndex,
      pageSize: this._paginator.pageSize,
      previousPageIndex: prevPageIndex,
    });

    this.current.pageIndex = pageIndex;
    this.changePage();

    this.pageEvent.emit({
      length: this._paginator.length,
      pageIndex: this._paginator.pageIndex,
      pageSize: this._paginator.pageSize,
      previousPageIndex: prevPageIndex,
    });
  }

  changePage(): void {
    const list = [...this.pageList];
    if (this.current) {
      const pageIndex = this.current.pageIndex;

      this.current.isFirst = pageIndex <= 0;
      this.current.isLast = pageIndex >= this.pageLength - 1;

      if (pageIndex <= this.PAGE.avgIdx || this.pageLength <= this.PAGE.max) {
        this.current.list = list.slice(0, this.PAGE.max);
      } else {
        let idx = pageIndex - this.PAGE.avgIdx;
        const isMax = idx + this.PAGE.max > this.pageLength;

        idx = isMax ? this.pageLength - this.PAGE.max : idx;
        this.current.list = list.slice(idx, this.PAGE.max + idx);
      }
      this.current.list.forEach((e) => {
        e.isActive = e.index === pageIndex;
      });

      if (this.current.pageIndex >= this.pageList.length) {
        this.pageList[this.pageList.length - 1].isActive = true;
      }
    } else {
      this.current = {
        pageIndex: 0,
        list: list.slice(0, this.PAGE.max),
        isFirst: true,
        isLast: this.pageLength === 1,
      };
      if (this.current?.list && this.current.list.length > 0 && this.current.list[0].isActive) {
        this.current.list[0].isActive = true;
      }
    }
  }

  changePageMax(currPageLenght: number) {
    if (window.innerWidth <= 768) {
      if (currPageLenght >= 900) {
        this.PAGE.max = 2;
        this.PAGE.avgIdx = 1;
      } else if (currPageLenght >= 90) {
        this.PAGE.max = 3;
        this.PAGE.avgIdx = 1;
      } else {
        this.resetPageMax();
      }
    }
  }

  resetPageMax() {
    this.PAGE.max = 5;
    this.PAGE.avgIdx = 2;
  }

  changeRecord(pageSize = 10) {
    this.pageSize = pageSize;
    this.pageChangeRecord.emit(this.pageSize);
  }
}
