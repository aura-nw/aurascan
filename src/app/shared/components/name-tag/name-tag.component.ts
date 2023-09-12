import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { Router } from '@angular/router';
import { LENGTH_CHARACTER } from 'src/app/core/constants/common.constant';
import { CommonService } from 'src/app/core/services/common.service';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-name-tag',
  templateUrl: './name-tag.component.html',
  styleUrls: ['./name-tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NameTagComponent implements OnInit, OnChanges {
  @Input() value = '';
  @Input() url = 'account';
  @Input() fullText = false;
  @Input() fullTextMob = false;
  @Input() isLink = true;
  @Input() isBox = true;
  @Input() param = '';
  @Input() type = '';
  @Input() isHref = false;
  @Input() iconContract = false;
  @Input() iconVerify = false;
  @Input() paramUrl = '';
  @Input() isTokenDetail = false;
  @Input() extendUrl = false;
  @Input() widthAuto = false;
  @Input() maxCharacter = 16;
  @Input() tooltipPosition: 'tooltip--left' | 'tooltip--right' | 'tooltip--below' | null = null;

  extendUrlLink = '';

  constructor(public commonService: CommonService, public global: Globals) {}

  ngOnInit(): void {
    if (this.extendUrl) {
      this.extendUrlLink = this.commonService.findUrlNameTag(this.value || this.paramUrl);
    }
  }

  isContractAddress(address) {
    if (address?.startsWith('aura') && address?.length === LENGTH_CHARACTER.CONTRACT) {
      return true;
    }
    return false;
  }

  extendLink(url) {
    url = url.match(/^https?:/) ? url : '//' + url;
    return url;
  }

  ngOnChanges(changes: SimpleChanges): void {
  }
}
