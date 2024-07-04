import { Component, Input, OnInit } from '@angular/core';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
interface IDecodeData {
  name: string;
  decode: string;
  isLink: boolean;
}
@Component({
  selector: 'app-decode-message',
  templateUrl: './decode-message.component.html',
  styleUrls: ['./decode-message.component.scss'],
})
export class DecodeMessageComponent implements OnInit {
  @Input() index?: string;
  @Input() isLink?: boolean;
  @Input() name?: string;
  @Input() isAllowSwitchDecode?: boolean;
  @Input() value: string;
  @Input() decode: string;
  @Input() isHighlight?: boolean;
  @Input() isDataField?: boolean;

  data: string | any[] = '';
  type: 'Decode' | 'Hex' = 'Hex';
  isMobile = false;

  constructor(private environmentService: EnvironmentService) {}

  ngOnInit(): void {
    this.isMobile = this.environmentService.isMobile;
    this.data = this.value;
  }
  onDecode(field?: string) {
    this.type = 'Decode';
    if(field !== 'data'){
      this.data = this.decode;
      return;
    }

    this.data = Array.isArray(this.decode) && this.decode?.map(item => {
      if(item?.type !== 'tuple') {
        return {
          ...item,
          isArray: false,
        }
      }
      if(item?.type === 'tuple') {
        const links = item?.decode?.split(',')?.map(item => {
          if(item?.startsWith('0x')) {
            return {
              name: item,
              isLink: true,
            }
          }
          return {
            name : item,
            isLink : false
          }
        });
        return {
          ...item,
          isArray: true,
          decode: links
        }
      }
    })
    console.log(this.data);
    
  }

  onHex() {
    this.type = 'Hex';
    this.data = this.value;
  }
}
