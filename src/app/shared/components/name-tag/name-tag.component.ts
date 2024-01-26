import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import { NameTagService } from 'src/app/core/services/name-tag.service';

@Component({
  selector: 'app-name-tag',
  templateUrl: './name-tag.component.html',
  styleUrls: ['./name-tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NameTagComponent implements OnInit {
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
  @Input() isShorterText = false;
  @Input() tooltipPosition: 'tooltip--left' | 'tooltip--right' | 'tooltip--below' | null = null;

  extendUrlLink = '';

  constructor(
    public commonService: CommonService,
    public nameTagService: NameTagService,
  ) {}

  ngOnInit(): void {
    if (this.extendUrl) {
      this.extendUrlLink = this.nameTagService.findUrlByAddress(this.value || this.paramUrl);
    }

    if (this.isShorterText) {
      this.maxCharacter = 12;
    }
  }

  isContractAddress(address) {
    return this.commonService.isValidContract(address);
  }

  extendLink(url) {
    url = url.match(/^https?:/) ? url : '//' + url;
    return url;
  }

  displayContent(value) {
    let result = value;
    if (this.nameTagService.isPublic(value)) {
      result += '<br>' + 'Public name: ' + this.nameTagService.findNameTagByAddress(value, false);
    }
    if (this.nameTagService.isPrivate(value)) {
      result += '<br>' + 'Private name: ' + this.nameTagService.findNameTagByAddress(value);
    }
    return result;
  }
}
