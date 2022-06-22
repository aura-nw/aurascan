import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-token-holding',
  templateUrl: './token-holding.component.html',
  styleUrls: ['./token-holding.component.scss']
})
export class TokenHoldingComponent implements OnInit {
  tokenId = '';
  constructor(private route:ActivatedRoute) { }

  ngOnInit(): void {
    this.tokenId = this.route.snapshot.paramMap.get('tokenId');
  }

  copyData(text: string): void {
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    // fake event click out side copy button
    // this event for hidden tooltip
    setTimeout(function (){
      document.getElementById('popupCopy').click();
    }, 800)
  }
}
