import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';

@Component({
  selector: 'app-horizontal',
  templateUrl: './horizontal.component.html',
  styleUrls: ['./horizontal.component.scss'],
})

/**
 * Horizontal Component
 */
export class HorizontalComponent implements OnInit {
  notice = this.environmentService.environment.notice;

  constructor(public router: Router, private environmentService: EnvironmentService) {}

  ngOnInit(): void {
    document.body.setAttribute('data-layout', 'horizontal');
    document.body.removeAttribute('data-sidebar');
  }
}
